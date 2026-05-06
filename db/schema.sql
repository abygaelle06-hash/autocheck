-- AutoCheck - Schema Supabase / PostgreSQL
-- Tables: settings, users, scans, quotes

-- Table settings: parametres modifiables en runtime
CREATE TABLE settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valeurs par defaut
INSERT INTO settings (key, value, description) VALUES
  ('cardeen_api_url', 'https://api.cardeen.com', 'URL de base API Cardeen'),
  ('cardeen_api_key', '', 'Cle API Cardeen (a configurer)'),
  ('client_scan_price', '29.99', 'Prix du scan pour le client (EUR)'),
  ('marketplace_commission', '0.08', 'Commission marketplace (8%)'),
  ('lacour_api_enabled', 'true', 'Activer l\'enrichissement Lacour'),
  ('persistent_storage_enabled', 'false', 'Backup images en storage Supabase'),
  ('maintenance_mode', 'false', 'Switch de maintenance');

-- Table users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'client'
    CHECK (role IN ('client', 'garage', 'fleet_manager')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table scans
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PROCESSING', 'FINISHED', 'ERROR')),
  vehicle_data JSONB DEFAULT '{}',
  damage_report JSONB DEFAULT '{}',
  lacour_enriched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table quotes (devis garage)
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id),
  garage_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_scans_case_id ON scans(case_id);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_quotes_scan_id ON quotes(scan_id);
