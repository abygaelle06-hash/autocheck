// backend/server.js
// AutoCheck - Serveur Fastify
// Webhook Cardeen + API Checkout + Enrichissement Lacour

require('dotenv').config();
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { supabase } = require('./services/supabase');
const { getConfig } = require('./services/config');
const lacourApi = require('./services/lacourApi');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = Fastify({
  logger: true
});

// --- CORS ---
app.register(cors, {
  origin: ['http://localhost:3000', process.env.FRONTEND_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// --- Health Check ---
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// --- Webhook Cardeen ---
// POST /webhooks/cardeen
app.post('/webhooks/cardeen', async (request, reply) => {
  try {
    const { eventType, caseId, inspectionResult } = request.body;

    if (!eventType || !caseId) {
      return reply.code(400).send({ error: 'eventType et caseId requis' });
    }

    const appConfig = await getConfig();
    const lacourEnabled = appConfig.lacour_api_enabled === 'true';

    if (eventType === 'INSPECTION_FINISHED') {
      // Recupere le rapport via API Cardeen
      const cardeenUrl = appConfig.cardeen_api_url;
      const cardeenKey = appConfig.cardeen_api_key;

      // Simulation: en prod, fetch(`${cardeenUrl}/inspections/${caseId}/report`)
      const damageReport = inspectionResult || {};

      // Enrichissement Lacour si active
      let lacourEnriched = false;
      if (lacourEnabled) {
        for (const damage of damageReport.damages || []) {
          if (damage.partId) {
            const partPrice = await lacourApi.getPartPrice(damage.partId);
            damage.estimatedPrice = partPrice;
          }
        }
        lacourEnriched = true;
      }

      // Sauvegarde en DB
      const { data, error } = await supabase
        .from('scans')
        .upsert({
          case_id: caseId,
          status: 'FINISHED',
          vehicle_data: damageReport.vehicleData || {},
          damage_report: damageReport,
          lacour_enriched: lacourEnriched,
          updated_at: new Date().toISOString()
        }, { onConflict: 'case_id' });

      if (error) throw error;

      // TODO: Notification push via Firebase
      // await firebase.sendPush(scan.userId, 'Votre inspection est prete');

      reply.code(200).send({ status: 'ok', scan: data });
    } else {
      // Autres evenements: SCANNER_STARTED, etc.
      await supabase
        .from('scans')
        .insert({ case_id: caseId, status: 'PROCESSING' });
      reply.code(202).send({ status: 'processing' });
    }

  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Erreur interne', message: err.message });
  }
});

// --- API Checkout Stripe ---
// POST /api/create-checkout
app.post('/api/create-checkout', async (request, reply) => {
  try {
    const appConfig = await getConfig();
    const scanPrice = parseFloat(appConfig.client_scan_price) || 29.99;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'AutoCheck - Inspection vehicule' },
          unit_amount: Math.round(scanPrice * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/?canceled=true`
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
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('case_id', caseId)
      .single();

    if (error) throw error;
    reply.send(data);
  } catch (err) {
    reply.code(404).send({ error: 'Scan non trouve', message: err.message });
  }
});

// --- API Garage Quotes ---
// POST /api/quotes
app.post('/api/quotes', async (request, reply) => {
  try {
    const { scanId, garageId, amount } = request.body;
    const { data, error } = await supabase
      .from('quotes')
      .insert({ scan_id: scanId, garage_id: garageId, amount })
      .select()
      .single();

    if (error) throw error;
    reply.send(data);
  } catch (err) {
    reply.code(400).send({ error: 'Erreur creation devis', message: err.message });
  }
});

// --- Demarrage serveur ---
const start = async () => {
  try {
    await app.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' });
    console.log(`Server running at http://0.0.0.0:${process.env.PORT || 3001}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
