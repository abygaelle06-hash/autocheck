// backend/services/config.js
// Gestion des parametres modifiables en runtime via la table settings

const { supabase } = require('./supabase');

// Cache memoire pour eviter les appels repetes a la DB
let configCache = {};
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30000; // 30 secondes

/**
 * Recupere la config complete depuis la table settings
 * Utilise un cache en memoire pour limiter les requetes DB
 */
async function getAppConfig() {
  const now = Date.now();

  if (configCache && now - cacheTimestamp < CACHE_TTL_MS) {
    return configCache;
  }

  const { data, error } = await supabase
    .from('settings')
    .select('key, value');

  if (error) {
    console.error('Erreur lecture config:', error.message);
    return configCache; // retourne le cache anterieur
  }

  configCache = data.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  cacheTimestamp = now;
  return configCache;
}

/**
 * Recupere une valeur specifique
 */
async function getConfig(key) {
  const config = await getAppConfig();
  return config[key];
}

/**
 * Met a jour une valeur dans la table settings
 * (pour le dashboard admin)
 */
async function setConfig(key, value) {
  const { data, error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select()
    .single();

  if (error) throw error;

  // Invalidate le cache
  configCache = {};
  cacheTimestamp = 0;

  return data;
}

module.exports = {
  getAppConfig,
  getConfig,
  setConfig
};
