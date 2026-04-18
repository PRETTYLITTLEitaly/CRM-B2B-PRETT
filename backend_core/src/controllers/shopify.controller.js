const shopifyService = require('../services/shopify.service');
const { verifyShopifyWebhook } = require('../utils/shopify.utils');
const prisma = require('../config/db');

/**
 * STEP 2 dell'OAuth: Shopify reindirizza qui con un codice temporaneo.
 * Scambiamo il codice con un access token permanente e lo salviamo nel DB.
 */
const handleOAuthCallback = async (req, res) => {
  const { code, shop, hmac, state } = req.query;

  if (!code || !shop) {
    return res.status(400).send('Parametri OAuth mancanti (code, shop).');
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;

  try {
    console.log(`[SHOPIFY OAUTH] Scambio codice per token. Shop: ${shop}`);

    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code: code,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SHOPIFY OAUTH ERROR]', response.status, errorText);
      return res.status(500).send(`Errore OAuth Shopify: ${errorText}`);
    }

    const data = await response.json();
    const accessToken = data.access_token;

    if (!accessToken) {
      return res.status(500).send('Nessun access token ricevuto da Shopify.');
    }

    // Salva il token nel database
    await prisma.setting.upsert({
      where: { key: 'shopify_access_token' },
      update: { value: accessToken },
      create: { key: 'shopify_access_token', value: accessToken },
    });

    console.log('[SHOPIFY OAUTH] ✅ Token salvato nel database con successo!');

    // Reindirizza al CRM con messaggio di successo
    res.redirect('/?shopify_connected=true');
  } catch (error) {
    console.error('[SHOPIFY OAUTH CALLBACK ERROR]', error.message);
    res.status(500).send(`Errore interno: ${error.message}`);
  }
};

const handleWebhook = async (req, res, next) => {
  if (!verifyShopifyWebhook(req)) {
    console.warn('[SHOPIFY WEBHOOK] Validazione fallita.');
    return res.status(401).send('Unauthorized');
  }

  try {
    const orderData = req.body;
    const topic = req.get('X-Shopify-Topic');
    console.log(`[SHOPIFY WEBHOOK] Ricevuto topic: ${topic} per ordine: ${orderData.id}`);
    await shopifyService.processShopifyOrder(orderData);
    res.status(200).send('Webhook Received');
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error.message);
    res.status(500).send('Internal Error');
  }
};

const syncOrders = async (req, res, next) => {
  try {
    console.log('[SHOPIFY CONTROLLER] Avvio sincronizzazione manuale...');
    const orders = await shopifyService.syncOrders();
    console.log(`[SHOPIFY CONTROLLER] Sincronizzazione finita. Totale: ${orders.length}`);
    res.json({
      success: true,
      message: `Sincronizzazione completata: ${orders.length} ordini processati.`,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('[SHOPIFY CONTROLLER ERROR]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  handleWebhook,
  syncOrders,
  handleOAuthCallback,
};
