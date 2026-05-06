// backend/services/lacourApi.js
// Enrichissement des dommages avec les prix pieces du Groupe Lacour

const axios = require('axios');

const LACOUR_BASE_URL = process.env.LACOUR_API_URL || 'https://api.grouplacour.com';
const LACOUR_API_KEY = process.env.LACOUR_API_KEY;

/**
 * Recupere le prix d'une piece automobile
 * @param {string} partId - ID de la piece
 * @returns {Promise<number>} - Prix estime
 */
async function getPartPrice(partId) {
  try {
    const response = await axios.get(
      `${LACOUR_BASE_URL}/parts/${partId}/price`,
      {
        headers: {
          'Authorization': `Bearer ${LACOUR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.price || response.data.EstimatedPrice;
  } catch (error) {
    console.error(`Erreur appel Lacour API pour la piece ${partId}:`, error.message);
    // Retourne un prix par defaut en cas d'erreur
    return null;
  }
}

/**
 * Recupere la disponibilite et delai d'une piece
 * @param {string} partId - ID de la piece
 * @returns {Promise<object>} - Info disponibilite
 */
async function getPartAvailability(partId) {
  try {
    const response = await axios.get(
      `${LACOUR_BASE_URL}/parts/${partId}/availability`,
      {
        headers: {
          'Authorization': `Bearer ${LACOUR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return {
      available: response.data.available,
      deliveryDays: response.data.delivery_days,
      supplier: response.data.supplier
    };
  } catch (error) {
    console.error(`Erreur Lacour availability:`, error.message);
    return { available: false };
  }
}

module.exports = {
  getPartPrice,
  getPartAvailability
};
