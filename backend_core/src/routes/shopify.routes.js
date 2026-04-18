const express = require('express');
const router = express.Router();
const shopifyController = require('../controllers/shopify.controller');

router.get('/auth', (req, res) => {
  const shopName = process.env.SHOPIFY_SHOP_NAME;
  if (!shopName) return res.status(500).json({ error: 'SHOPIFY_SHOP_NAME mancante' });
  const cleanShop = shopName.replace('https://', '').replace('.myshopify.com', '').replace(/\/$/, '') + '.myshopify.com';
  
  const apiKey = process.env.SHOPIFY_API_KEY;
  const redirectUri = `${process.env.APP_URL || 'https://app.wholesale-prettylittle.it'}/api/shopify/callback`;
  const scopes = 'read_orders,read_customers,read_products,read_all_orders';

  const authUrl = `https://${cleanShop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(authUrl);
});

router.get('/callback', shopifyController.handleOAuthCallback);
router.get('/sync', shopifyController.syncOrders);

router.get('/debug', async (req, res) => {
  try {
    const service = require('../services/shopify.service');
    let shopName = process.env.SHOPIFY_SHOP_NAME;
    if (!shopName) throw new Error('SHOPIFY_SHOP_NAME non configurato');
    const cleanShop = shopName.replace('https://', '').replace('.myshopify.com', '').replace(/\/$/, '') + '.myshopify.com';
    
    const accessToken = await service.getStoredAccessToken();
    
    // Info Negozio
    const shopRes = await fetch(`https://${cleanShop}/admin/api/2024-01/shop.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });
    const shopData = await shopRes.json();

    // Conteggio Ordini
    const countRes = await fetch(`https://${cleanShop}/admin/api/2024-01/orders/count.json?status=any`, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });
    const countData = await countRes.json();

    // Conteggio Bozze
    const draftCountRes = await fetch(`https://${cleanShop}/admin/api/2024-01/draft_orders/count.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });
    const draftCountData = await draftCountRes.json();

    // Primi 10 ordini grezzi
    const ordersRes = await fetch(`https://${cleanShop}/admin/api/2024-01/orders.json?status=any&limit=10`, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });
    const ordersData = await ordersRes.json();

    res.json({
      configuredShop: shopName,
      cleanShop: cleanShop,
      actualShopName: shopData.shop?.name,
      orderCountFromShopify: countData.count,
      draftCountFromShopify: draftCountData.count,
      tokenStatus: accessToken ? 'PRESENTE' : 'MANCANTE',
      first10Orders: ordersData.orders?.map(o => ({
        id: o.id,
        number: o.order_number,
        email: o.email,
        customer: !!o.customer,
        shipping: !!o.shipping_address
      })),
      fullRawFirstOrder: ordersData.orders?.[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message, env: process.env.SHOPIFY_SHOP_NAME });
  }
});

router.post('/orders', shopifyController.handleWebhook);

module.exports = router;
