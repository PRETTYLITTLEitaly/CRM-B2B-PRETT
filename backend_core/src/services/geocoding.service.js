const axios = require('axios');
const prisma = require('../config/db');

/**
 * Service per la geocodifica degli indirizzi.
 * Utilizza Nominatim (OpenStreetMap) per convertire indirizzi in coordinate.
 */
const geocodeAddress = async (address, city, region, country = 'Italia') => {
  // Strategia 1: Indirizzo completo per massima precisione
  let query = `${address || ''}, ${city || ''}, ${country || 'Italia'}`.trim();
  if (query.length < 5) return null;

  try {
    let response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: query, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'PrettyB2B-CRM/1.0' }
    });

    if (response.data && response.data.length > 0) {
      return { lat: parseFloat(response.data[0].lat), lng: parseFloat(response.data[0].lon) };
    }

    // Strategia 2 Fallback: Solo città se l'indirizzo specifico fallisce
    query = `${city || ''}, ${country || 'Italia'}`.trim();
    response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: query, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'PrettyB2B-CRM/1.0' }
    });

    if (response.data && response.data.length > 0) {
      return { lat: parseFloat(response.data[0].lat), lng: parseFloat(response.data[0].lon) };
    }
  } catch (error) {
    console.error('[GEOCODING ERROR]', error.message);
  }
  return null;
};

/**
 * Aggiorna le coordinate di un cliente se mancanti.
 */
const updateCustomerCoordinates = async (customerId) => {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer || (customer.lat && customer.lng)) return;

  const coords = await geocodeAddress(customer.address, customer.city, customer.region, customer.country);
  if (coords) {
    await prisma.customer.update({
      where: { id: customerId },
      data: { lat: coords.lat, lng: coords.lng }
    });
    console.log(`[GEOCODING] Coordinate aggiornate per ${customer.businessName} (${customer.country})`);
  }
};

/**
 * Aggiorna le coordinate di un lead se mancanti.
 */
const updateLeadCoordinates = async (leadId) => {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead || (lead.lat && lead.lng)) return;

  const coords = await geocodeAddress(lead.address, lead.city, lead.region, lead.country);
  if (coords) {
    await prisma.lead.update({
      where: { id: leadId },
      data: { lat: coords.lat, lng: coords.lng }
    });
    console.log(`[GEOCODING] Coordinate aggiornate per il lead ${lead.storeName} (${lead.country})`);
  }
};

module.exports = {
  geocodeAddress,
  updateCustomerCoordinates,
  updateLeadCoordinates
};
