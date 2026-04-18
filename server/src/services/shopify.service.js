const prisma = require('../config/db');
const conversionService = require('./conversion.service');

/**
 * Elabora un ordine ricevuto da Shopify (Webhook o Sync).
 */
const processShopifyOrder = async (shopifyOrder) => {
  try {
    // 1. Usa il ConversionService per trovare o creare il cliente
    const customer = await conversionService.handleShopifyOrder(shopifyOrder);

    const totalItems = (shopifyOrder.line_items || []).reduce((sum, li) => sum + (li.quantity || 0), 0);
    const shopifyStatus = shopifyOrder.fulfillment_status === 'fulfilled' ? 'fulfilled' : (shopifyOrder.fulfillment_status === 'partial' ? 'partial' : 'unfulfilled');

    const order = await prisma.order.upsert({
      where: { id: shopifyOrder.id.toString() },
      update: {
        totalAmount: parseFloat(shopifyOrder.total_price),
        shopifyPaymentStatus: shopifyOrder.financial_status,
        fulfillmentStatus: shopifyStatus,
        itemsCount: totalItems,
        productsJson: shopifyOrder.line_items,
        date: new Date(shopifyOrder.created_at),
      },
      create: {
        id: shopifyOrder.id.toString(),
        orderNumber: (shopifyOrder.order_number || `DRAFT-${shopifyOrder.id}`).toString(),
        date: new Date(shopifyOrder.created_at),
        totalAmount: parseFloat(shopifyOrder.total_price),
        currency: shopifyOrder.currency,
        shopifyPaymentStatus: shopifyOrder.financial_status,
        fulfillmentStatus: shopifyStatus,
        itemsCount: totalItems,
        productsJson: shopifyOrder.line_items,
        customerId: customer.id,
        // Pre-impostiamo lo stato interno basandoci su Shopify al primo sync
        paymentStatus: shopifyOrder.financial_status === 'paid' ? 'SALDATO' : 'IN_ATTESA',
      },
    });

    console.log(`[SHOPIFY] Ordine ${order.orderNumber} elaborato con successo per ${customer.businessName}`);
    return order;
  } catch (error) {
    console.error('[SHOPIFY SERVICE ERROR]', error.message);
    throw error;
  }
};

module.exports = {
  processShopifyOrder,
};
