# AutoCheck - Strategie de Deploiement

## Stack & Couts

| Composant | Service | Plan | Cout mensuel |
|-----------|---------|------|-------------|
| Frontend | Vercel | Free (Hobby) | 0 EUR |
| Backend | Railway / Render | Starter | 5-10 EUR |
| Base de donnees | Supabase | Free Tier | 0 EUR (jusqu'a 500MB) |
| Storage images | Supabase Storage | Free | 0 EUR (1GB) |
| Paiements | Stripe | Standard | 1.4% + 0.25 EUR |
| Notifications | Firebase Cloud Messaging | Free | 0 EUR |

## Frontend - Vercel

1. Connecter le repo GitHub sur Vercel
2. Deployer depuis `frontend/` avec framework Next.js
3. Variables d'environnement:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BACKEND_URL`

## Backend - Railway

1. Nouvelle App > Deploy from GitHub repo
2. Root directory: `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Variables d'environnement (secrets):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `STRIPE_SECRET_KEY`
   - `LACOUR_API_URL`
   - `LACOUR_API_KEY`
   - `FRONTEND_URL`

### Webhook Cardeen

Configurer l'URL du webhook Cardeen vers:
```
https://votre-app.railway.app/webhooks/cardeen
```

## Base de donnees - Supabase

1. Creer un projet sur supabase.com
2. Aller dans SQL Editor et executer `db/schema.sql`
3. Copier les cles:
   - Project URL > `SUPABASE_URL`
   - Settings > API > anon key > `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Settings > API > service_role key > `SUPABASE_SERVICE_KEY`

## Stripe - Configuration

1. Creer un compte sur stripe.com
2. En mode Test, copier `sk_test_...` dans `STRIPE_SECRET_KEY`
3. Configurer le webhook Stripe vers:
   ```
   https://votre-app.railway.app/api/webhooks/stripe
   ```

## Points de vigilance

### Optimisation couts images
- **Mode 1 (default)**: Hotlinking - afficher les images directement depuis les URLs Cardeen
- **Mode 2 (option)**: Backup vers Supabase Storage si URLs expirent (activer `persistent_storage_enabled`)

### Instances autoscale
- Configurer autoscale sur Railway pour descendre a 0 instances la nuit
- Reduit significativement le cout serveur

### Phase 0 - Validations requises
- Obtenir la tarification Cardeen (critique si > 15 EUR/scan)
- Verifier que les URLs d'images Cardeen sont permanentes
