# AutoCheck

> Solution codee d'inspection automobile 100% optimisee couts

## Description

AutoCheck est une plateforme d'inspection automobile qui connecte les particuliers, garages et gestionnaires de flotte. Le vehicule est scanne par le service **Cardeen**, les dommages sont enrichis avec les prix pieces du **Groupe Lacour**, et le paiement est gere via **Stripe**.

## Stack Technique

| Couche | Technologie | Hebergement |
|--------|-------------|-------------|
| Frontend | React / Next.js | Vercel (gratuit) |
| Backend | Node.js / Fastify | Railway (~5-10 EUR/mois) |
| Base de donnees | Supabase (Postgres) | Free Tier (500MB) |
| Stockage images | Supabase Storage | Free (1GB) |
| Paiements | Stripe | 1.4% + 0.25 EUR |
| Notifications | Firebase Cloud Messaging | Gratuit |

## Structure du projet

```
autocheck/
├── backend/
│   ├── server.js              # Serveur Fastify
│   ├── package.json
│   ├── .env.example
│   └── services/
│       ├── supabase.js        # Connexion DB
│       ├── config.js          # Parametres runtime
│       └── lacourApi.js       # Enrichissement prix pieces
├── frontend/
│   └── components/
│       └── DamageReport.jsx   # Rapport de dommages
├── db/
│   └── schema.sql             # Schema Supabase
├── DEPLOYMENT.md              # Guide de deploiement
└── README.md
```

## Fonctionnalites

- **Webhook Cardeen** : Recoit les evenements `INSPECTION_FINISHED` et traite les rapports
- **Enrichissement Lacour** : Ajoute les prix des pieces aux dommages detectes
- **Checkout Stripe** : Paiement du scan a prix dynamique (configurable depuis la DB)
- **Dashboard client** : Rapport de damages interactif avec visualisation SVG
- **Parametres runtime** : URL API, tarification, activables sans redemarrage serveur

## Demarrage rapide

### 1. Base de donnees

Creer un projet sur Supabase, puis executer `db/schema.sql` dans le SQL Editor.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Editer .env avec vos cles
npm install
npm start
```

Le serveur ecoute sur `http://localhost:3001`.

### 3. Frontend

```bash
cd frontend
# Initialiser un projet Next.js
npx create-next-app@latest .
npm install @supabase/supabase-js
```

Integrer le composant `DamageReport.jsx` dans vos pages.

## Endpoints API

| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Health check |
| POST | `/webhooks/cardeen` | Webhook evenement Cardeen |
| POST | `/api/create-checkout` | Session paiement Stripe |
| GET | `/api/scan/:caseId` | Statut d'un scan |
| POST | `/api/quotes` | Creer un devis garage |

## Configuration

### Variables d'environnement (backend/.env)

```bash
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_KEY=votre-cle
STRIPE_SECRET_KEY=sk_test_...
LACOUR_API_URL=https://api.grouplacour.com
LACOUR_API_KEY=votre-cle
FRONTEND_URL=https://votre-domaine.com
PORT=3001
```

### Parametres modifiables depuis la table `settings`

| Cle | Description |
|-----|-------------|
| `cardeen_api_url` | URL de base API Cardeen |
| `client_scan_price` | Prix du scan pour le client |
| `marketplace_commission` | Commission marketplace |
| `lacour_api_enabled` | Activer/desactiver Lacour |
| `persistent_storage_enabled` | Backup images en storage |
| `maintenance_mode` | Switch de maintenance |

## Phases de developpement

- **Phase A** : Backend coeur (webhook + enrichissement)
- **Phase B** : Interfaces minimales (PWA client + dashboard garage)
- **Phase C** : Dashboard admin (gestion cles API, marges)
- **Phase D** : Integration Stripe production

## Points de vigilance

- Negocier le tarif Cardeen (seuil critique > 15 EUR/scan)
- Verifier la permanence des URLs d'images Cardeen
- Hotlinking images par defaut, storage Supabase en backup
- Instances autoscale la nuit pour reduire les couts serveur

## Validation requise (Phase 0)

- Obtenir la grille tarifaire Cardeen et la documentation API OAS 3.0
- Confirmer que les URLs d'images expirent ou non

---

*Projet issu du document "Solution Codee Optimisee Couts" - Gemini*
