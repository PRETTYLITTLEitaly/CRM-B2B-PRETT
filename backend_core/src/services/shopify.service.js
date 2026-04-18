const prisma = require('../config/db');
const conversionService = require('./conversion.service');

const getStoredAccessToken = async () => {
  const setting = await prisma.setting.findUnique({ where: { key: 'shopify_access_token' } });
  return setting?.value;
};

/**
 * Sincronizzazione AD OLTRANZA.
 * Non si ferma se un ordine ha dati mancanti (email, cliente, ecc).
 */
const syncOrders = async () => {
  const shopName = process.env.SHOPIFY_SHOP_NAME;
  if (!shopName) throw new Error('SHOPIFY_SHOP_NAME mancante');
  const cleanShop = shopName.replace('https://', '').replace('.myshopify.com', '').replace(/\/$/, '') + '.myshopify.com';

  const accessToken = await getStoredAccessToken();
  if (!accessToken) throw new Error('Token non trovato');

  console.log(`[SHOPIFY] Sync ad oltranza per: ${cleanShop}`);

  let totalCount = 0;

  // 1. ORDINI REGOLARI - Forziamo l'inizio dall'ID 1
  const regUrl = `https://${cleanShop}/admin/api/2024-01/orders.json?status=any&fulfillment_status=any&limit=250&since_id=1`;
  totalCount += await fetchWithHighResilience(regUrl, accessToken);

  // 2. DRAFT ORDERS
  const draftUrl = `https://${cleanShop}/admin/api/2024-01/draft_orders.json?status=open&limit=250`;
  totalCount += await fetchWithHighResilience(draftUrl, accessToken);

  return { success: true, count: totalCount };
};

async function fetchWithHighResilience(url, token) {
  let currentUrl = url;
  let savedCount = 0;

  while (currentUrl) {
    const response = await fetch(currentUrl, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    if (!response.ok) break;

    const data = await response.json();
    const items = data.orders || data.draft_orders || [];
    if (items.length === 0) break;

    for (const item of items) {
      try {
        const orderId = item.id.toString();
        const orderNum = (item.order_number || item.name || `DRAFT-${item.id}`).toString().replace(/^#/, '');
        
        let customerId = null;
        try {
          // Proviamo a convertire/trovare il cliente
          const customer = await conversionService.handleShopifyOrder(item);
          customerId = customer.id;
        } catch (e) {
          console.log(`[SHOPIFY] Ordine ${orderNum} senza cliente valido, lo carico comunque.`);
        }

        const totalItems = (item.line_items || []).reduce((sum, li) => sum + (li.quantity || 0), 0);
        const shopifyStatus = item.fulfillment_status === 'fulfilled' ? 'fulfilled' : (item.fulfillment_status === 'partial' ? 'partial' : 'unfulfilled');

        await prisma.order.upsert({
          where: { id: orderId },
          update: {
            totalAmount: parseFloat(item.total_price || item.total_price_set?.shop_money?.amount || 0),
            date: new Date(item.created_at),
            shopifyPaymentStatus: item.financial_status,
            fulfillmentStatus: shopifyStatus,
            itemsCount: totalItems,
            productsJson: item.line_items,
            discountsJson: (item.discount_codes && item.discount_codes.length > 0) ? item.discount_codes : ((item.discount_applications && item.discount_applications.length > 0) ? item.discount_applications : []),
          },
          create: {
            id: orderId,
            orderNumber: orderNum,
            date: new Date(item.created_at),
            totalAmount: parseFloat(item.total_price || item.total_price_set?.shop_money?.amount || 0),
            currency: item.currency || 'EUR',
            customerId: customerId,
            shopifyPaymentStatus: item.financial_status,
            fulfillmentStatus: shopifyStatus,
            itemsCount: totalItems,
            productsJson: item.line_items,
            discountsJson: (item.discount_codes && item.discount_codes.length > 0) ? item.discount_codes : ((item.discount_applications && item.discount_applications.length > 0) ? item.discount_applications : []),
            // Pre-impostiamo lo stato interno basandoci su Shopify al primo sync
            paymentStatus: item.financial_status === 'paid' ? 'SALDATO' : 'IN_ATTESA',
          },
        });
        savedCount++;
      } catch (err) {
        console.error(`[CRITICAL SKIP] Ordine ${item.id} fallito del tutto:`, err.message);
      }
    }

    const link = response.headers.get('Link');
    currentUrl = null;
    if (link) {
      const match = link.match(/<([^>]+)>; rel="next"/);
      if (match) currentUrl = match[1];
    }
  }
  return savedCount;
}

const processShopifyOrder = async (item) => {
  try {
    const orderId = item.id.toString();
    const orderNum = (item.order_number || `DRAFT-${item.id}`).toString();
    
    let customerId = null;
    try {
      const customer = await conversionService.handleShopifyOrder(item);
      customerId = customer.id;
    } catch (e) {
      console.log(`[SHOPIFY WEBHOOK] Ordine ${orderNum} senza cliente valido, lo carico comunque.`);
    }

    const totalItems = (item.line_items || []).reduce((sum, li) => sum + (li.quantity || 0), 0);
    const shopifyStatus = item.fulfillment_status === 'fulfilled' ? 'fulfilled' : (item.fulfillment_status === 'partial' ? 'partial' : 'unfulfilled');

    return await prisma.order.upsert({
      where: { id: orderId },
      update: {
        totalAmount: parseFloat(item.total_price || item.total_price_set?.shop_money?.amount || 0),
        date: new Date(item.created_at),
        shopifyPaymentStatus: item.financial_status,
        fulfillmentStatus: shopifyStatus,
        itemsCount: totalItems,
        productsJson: item.line_items,
        discountsJson: (item.discount_codes && item.discount_codes.length > 0) ? item.discount_codes : ((item.discount_applications && item.discount_applications.length > 0) ? item.discount_applications : []),
      },
      create: {
        id: orderId,
        orderNumber: orderNum,
        date: new Date(item.created_at),
        totalAmount: parseFloat(item.total_price || item.total_price_set?.shop_money?.amount || 0),
        currency: item.currency || 'EUR',
        customerId: customerId,
        shopifyPaymentStatus: item.financial_status,
        fulfillmentStatus: shopifyStatus,
        itemsCount: totalItems,
        productsJson: item.line_items,
        discountsJson: (item.discount_codes && item.discount_codes.length > 0) ? item.discount_codes : ((item.discount_applications && item.discount_applications.length > 0) ? item.discount_applications : []),
        paymentStatus: item.financial_status === 'paid' ? 'SALDATO' : 'IN_ATTESA',
      },
    });
  } catch (error) {
    console.error(`[WEBHOOK CRITICAL] Ordine ${item.id} fallito del tutto:`, error.message);
    throw error;
  }
};

module.exports = { syncOrders, getStoredAccessToken, processShopifyOrder };
