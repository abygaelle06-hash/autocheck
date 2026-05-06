# Changelog AutoCheck

## [1.1.0] - 2024-05-06

### ✨ Nouvelles fonctionnalites

#### Frontend
- **Refonte complete de l'UI** avec design moderne et professionnel
- **Hero section** avec gradient moderne et statistiques en temps reel
- **Section features** presentant les avantages cles d'AutoCheck
- **Composant DamageReport entierement reecrit** avec :
  - Cards de dommages interactives
  - Modal de detail avec informations enrichies Lacour
  - Grille responsive pour tous les ecrans
  - Badges de severite colores (light/moderate/severe)
  - Stats visuelles (nombre de dommages, perte de valeur, enrichissement Lacour)
- **Gestion d'erreurs amelioree** avec messages utilisateur clairs

#### Backend
- **Nouvelle route `/api/config/public`** pour exposer la config au frontend
- **Route `/api/scans`** pour lister tous les scans avec pagination
- **Protection Stripe optionnelle** : le backend ne crash plus si la cle Stripe n'est pas definie
- **Validation renforcee** des parametres sur toutes les routes
- **Logging ameliore** avec niveaux de log configurables (production vs dev)
- **Mode maintenance** verifie avant les paiements

### 🐛 Corrections de bugs

#### Backend (`backend/server.js`)
1. **Fix duplication de scans** : Le webhook SCANNER_STARTED verifie maintenant si un scan existe avant d'inserer
2. **Fix enrichissement Lacour** : Utilisation de `Promise.all` pour paralleliser les appels API
3. **Fix gestion erreurs Stripe** : Retourne 503 si Stripe n'est pas configure au lieu de crash
4. **Fix CORS** : `credentials: true` ajoute pour supporter les cookies
5. **Fix validation caseId** : Trim et validation avant requete DB
6. **Fix retour API scan** : Utilise `.maybeSingle()` au lieu de `.single()` pour eviter les erreurs si scan introuvable

#### Frontend (`frontend/app/page.tsx`)
1. **Fix data fetching** : `setScanData(data)` pour passer les donnees reelles a `DamageReport`
2. **Fix gestion erreurs** : Try/catch avec affichage d'erreur utilisateur
3. **Fix URL encoding** : `encodeURIComponent(caseId)` pour supporter les IDs speciaux
4. **Fix loading states** : Boutons desactives pendant le chargement
5. **Fix responsive** : Grid et flexbox responsive sur tous les breakpoints

#### Frontend (`frontend/components/DamageReport.jsx`)
1. **Fix bug SSR** : Suppression de l'injection de style via `document.createElement` (incompatible SSR)
2. **Fix props** : Accepte `scanData` directement au lieu de fetch interne
3. **Fix Supabase client** : Suppression du client cote composant (data deja fetched par parent)
4. **Fix affichage vide** : Gestion correcte des cas `!scanData`
5. **Fix severite** : Mapping correct des couleurs selon severity (light/moderate/severe)

#### Frontend (`frontend/app/admin/page.tsx`)
1. **Fix lien retour** : `/autocheck/` → `/` pour navigation correcte

#### Backend (`backend/package.json`)
1. **Ajout nodemon** en devDependency pour hot-reload en developpement
2. **Bump version** vers 1.1.0

### 🛠️ Ameliorations techniques

#### Backend
- Separation claire des responsabilites (services/)
- Cache config de 30s pour reduire les requetes DB
- Gestion d'erreurs globale avec `setErrorHandler`
- Support des variables d'environnement avec fallbacks
- Messages de log structures

#### Frontend
- Architecture composants reutilisables
- Styles inline pour eviter les conflits CSS
- Palette de couleurs centralisee
- Transitions et animations CSS
- Support dark mode ready (variables de couleurs)

### 📖 Documentation

- README.md complet avec architecture et instructions
- Schema Supabase documente avec commentaires
- Fichiers .env.example pour backend et frontend
- Ce CHANGELOG pour tracker les modifications

### 🔧 Operations

#### Variables d'environnement requises

**Backend (.env):**
```
PORT=3001
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
STRIPE_SECRET_KEY=sk_xxx (optionnel)
FRONTEND_URL=http://localhost:3000
LACOUR_API_URL=https://api.grouplacour.com
LACOUR_API_KEY=xxx (optionnel)
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 🚀 Installation & Demarrage

```bash
# Backend
cd backend
npm install
cp services/.env.example .env  # Configurer les variables
npm run dev

# Frontend
cd frontend
npm install
cp .env.local.example .env.local  # Configurer les variables
npm run dev
```

Acces : http://localhost:3000

### 🎯 Prochaines etapes recommandees

- [ ] Tests unitaires backend (Jest)
- [ ] Tests E2E frontend (Playwright)
- [ ] CI/CD avec GitHub Actions
- [ ] Deploiement Vercel (frontend) + Railway/Render (backend)
- [ ] Integration vraie API Cardeen
- [ ] Integration vraie API Groupe Lacour
- [ ] Notifications push Firebase
- [ ] Generation PDF des rapports
- [ ] Dashboard analytics admin
- [ ] API RESTful complete avec OpenAPI spec

---

## [1.0.0] - 2024-05-06 (Initial)

### ✅ Version initiale

- Architecture base : Backend Fastify + Frontend Next.js + Supabase
- Schema DB avec tables : settings, users, scans, quotes
- Webhook Cardeen pour reception des inspections
- API Checkout Stripe pour paiements
- Composants React de base
- Integration Lacour pour enrichissement prix pieces
