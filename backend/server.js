// backend/server.js
// AutoCheck - Serveur Fastify
// Webhook Cardeen + API Checkout + Enrichissement Lacour

require('dotenv').config();
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { supabase } = require('./services/supabase');
const { getAppConfig } = require('./services/config');
const lacourApi = require('./services/lacourApi');

// Initialisation Stripe (optionnel si cle non definie)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  }
});

// --- CORS ---
app.register(cors, {
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// --- Health Check ---
app.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});

// --- Webhook Cardeen ---
// POST /webhooks/cardeen
app.post('/webhooks/cardeen', async (request, reply) => {
  try {
    const { eventType, caseId, inspectionResult } = request.body;

    if (!eventType || !caseId) {
      return reply.code(400).send({ error: 'eventType et caseId requis' });
    }

    const appConfig = await getAppConfig();
    const lacourEnabled = appConfig.lacour_api_enabled === 'true';

    if (eventType === 'INSPECTION_FINISHED') {
      const damageReport = inspectionResult || {};

      // Enrichissement Lacour si active
      let lacourEnriched = false;
      if (lacourEnabled && damageReport.damages) {
        const enrichmentPromises = damageReport.damages
          .filter(d => d.partId)
          .map(async (damage) => {
            try {
              const [price, availability] = await Promise.all([
                lacourApi.getPartPrice(damage.partId),
                lacourApi.getPartAvailability(damage.partId)
              ]);
              damage.estimatedPrice = price;
              damage.availability = availability;
            } catch (e) {
              request.log.warn(`Lacour enrichment failed for part ${damage.partId}: ${e.message}`);
            }
          });
        await Promise.all(enrichmentPromises);
        lacourEnriched = true;
      }

      // Sauvegarde/mise a jour en DB
      const { data, error } = await supabase
        .from('scans')
        .upsert({
          case_id: caseId,
          status: 'FINISHED',
          vehicle_data: damageReport.vehicleData || {},
          damage_report: damageReport,
          lacour_enriched: lacourEnriched,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'case_id'
        })
        .select()
        .single();

      if (error) throw error;

      return reply.code(200).send({ status: 'ok', scan: data });

    } else if (eventType === 'SCANNER_STARTED') {
      // Verifier si un scan existe deja avant d'inserer
      const { data: existing } = await supabase
        .from('scans')
        .select('id')
        .eq('case_id', caseId)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase
          .from('scans')
          .insert({ case_id: caseId, status: 'PROCESSING' });
        if (error) throw error;
      } else {
        await supabase
          .from('scans')
          .update({ status: 'PROCESSING', updated_at: new Date().toISOString() })
          .eq('case_id', caseId);
      }

      return reply.code(202).send({ status: 'processing' });

    } else {
      // Autres evenements ignores
      return reply.code(200).send({ status: 'ignored', eventType });
    }

  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Erreur interne', message: err.message });
  }
});

// --- API Checkout Stripe ---
// POST /api/create-checkout
app.post('/api/create-checkout', async (request, reply) => {
  if (!stripe) {
    return reply.code(503).send({ error: 'Paiement non configure' });
  }
  try {
    const appConfig = await getAppConfig();
    const scanPrice = parseFloat(appConfig.client_scan_price) || 29.99;
    const maintenanceMode = appConfig.maintenance_mode === 'true';

    if (maintenanceMode) {
      return reply.code(503).send({ error: 'Service en maintenance' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'AutoCheck - Inspection vehicule',
            description: 'Rapport complet avec estimation des reparations'
          },
          unit_amount: Math.round(scanPrice * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${frontendUrl}/success?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/?canceled=true`
    });

    reply.send({ url: session.url });
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Erreur Stripe', message: err.message });
  }
});

// --- API Scan Status ---
// GET /api/scan/:caseId
app.get('/api/scan/:caseId', async (request, reply) => {
  try {
    const { caseId } = request.params;

    if (!caseId || caseId.trim() === '') {
      return reply.code(400).send({ error: 'caseId invalide' });
    }

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('case_id', caseId.trim())
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return reply.code(404).send({ error: 'Scan non trouve' });
    }

    reply.send(data);
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Erreur serveur', message: err.message });
  }
});

// --- API liste des scans ---
// GET /api/scans
app.get('/api/scans', async (request, reply) => {
  try {
    const { status, limit = 50, offset = 0 } = request.query;

    let query = supabase
      .from('scans')
      .select('id, case_id, status, vehicle_data, lacour_enriched, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    reply.send({ scans: data, count: data.length });
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Erreur serveur', message: err.message });
  }
});

// --- API Garage Quotes ---
// POST /api/quotes
app.post('/api/quotes', async (request, reply) => {
  try {
    const { scanId, garageId, amount } = request.body;

    if (!scanId || !garageId || !amount) {
      return reply.code(400).send({ error: 'scanId, garageId et amount requis' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return reply.code(400).send({ error: 'amount doit etre un nombre positif' });
    }

    const { data, error } = await supabase
      .from('quotes')
      .insert({
        scan_id: scanId,
        garage_id: garageId,
        amount
      })
      .select()
      .single();

    if (error) throw error;

    reply.code(201).send(data);
  } catch (err) {
    request.log.error(err);
    reply.code(400).send({ error: 'Erreur creation devis', message: err.message });
  }
});

// --- API Config (lecture seule pour le frontend) ---
// GET /api/config/public
app.get('/api/config/public', async (request, reply) => {
  try {
    const appConfig = await getAppConfig();
    // Exposer seulement les cles non sensibles
    reply.send({
      client_scan_price: appConfig.client_scan_price || '29.99',
      maintenance_mode: appConfig.maintenance_mode || 'false',
      lacour_api_enabled: appConfig.lacour_api_enabled || 'true'
    });
  } catch (err) {
    reply.code(500).send({ error: 'Erreur config', message: err.message });
  }
});

// --- Gestion erreurs globales ---
app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.code(error.statusCode || 500).send({
    error: error.message || 'Erreur interne'
  });
});

// --- Demarrage serveur ---
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`AutoCheck Backend running on http://0.0.0.0:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
