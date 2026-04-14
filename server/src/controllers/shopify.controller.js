const shopifyService = require('../services/shopify.service');
const { verifyShopifyWebhook } = require('../utils/shopify.utils');

const handleWebhook = async (req, res, next) => {
  // 1. Validazione HMAC
  if (!verifyShopifyWebhook(req)) {
    console.warn('[SHOPIFY WEBHOOK] Validazione fallita. Possibile richiesta non autorizzata.');
    return res.status(401).send('Unauthorized');
  }

  try {
    const orderData = req.body;
    const topic = req.get('X-Shopify-Topic');

    console.log(`[SHOPIFY WEBHOOK] Ricevuto topic: ${topic} per ordine: ${orderData.id}`);

    // 2. Elaborazione dell'ordine
    await shopifyService.processShopifyOrder(orderData);

    // 3. Risposta immediata a Shopify (200 OK)
    res.status(200).send('Webhook Received');
  } catch (error) {
    // In un webhook è meglio loggare l'errore e rispondere comunque con 200 o 500
    // Shopify riproverà l'invio in caso di fallimento se configurato
    console.error('[WEBHOOK ERROR]', error.message);
    res.status(500).send('Internal Error');
  }
};

module.exports = {
  handleWebhook,
};
