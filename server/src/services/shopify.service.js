const prisma = require('../config/db');
const conversionService = require('./conversion.service');

/**
 * Elabora un ordine ricevuto da Shopify (Webhook o Sync).
 */
const processShopifyOrder = async (shopifyOrder) => {
  try {
    // 1. Usa il ConversionService per trovare o creare il cliente
    const customer = await conversionService.handleShopifyOrder(shopifyOrder);

    // 2. Salva o Aggiorna l'ordine nel database (Upsert)
    const order = await prisma.order.upsert({
      where: { id: shopifyOrder.id.toString() },
      update: {
        totalAmount: parseFloat(shopifyOrder.total_price),
        paymentStatus: shopifyOrder.financial_status,
        fulfillmentStatus: shopifyOrder.fulfillment_status,
        productsJson: shopifyOrder.line_items,
        date: new Date(shopifyOrder.created_at),
      },
      create: {
        id: shopifyOrder.id.toString(),
        orderNumber: shopifyOrder.order_number.toString(),
        date: new Date(shopifyOrder.created_at),
        totalAmount: parseFloat(shopifyOrder.total_price),
        currency: shopifyOrder.currency,
        paymentStatus: shopifyOrder.financial_status,
        fulfillmentStatus: shopifyOrder.fulfillment_status,
        productsJson: shopifyOrder.line_items,
        customerId: customer.id,
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
