const crypto = require('crypto');

/**
 * Valida il webhook di Shopify confrontando l'HMAC inviato con quello calcolato.
 */
const verifyShopifyWebhook = (req) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = JSON.stringify(req.body);
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!hmac || !secret) return false;

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmac;
};

module.exports = {
  verifyShopifyWebhook,
};
