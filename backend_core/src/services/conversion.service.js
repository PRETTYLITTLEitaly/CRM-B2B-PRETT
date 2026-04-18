const prisma = require('../config/db');

/**
 * Service per gestire il matching e la conversione dei Lead in Clienti.
 */
class ConversionService {
  /**
   * Cerca un cliente esistente per email o telefono.
   */
  async findExistingCustomer(email, phone) {
    if (!email && !phone) return null;

    return await prisma.customer.findFirst({
      where: {
        OR: [
          email ? { email } : null,
          phone ? { phone } : null,
        ].filter(Boolean),
      },
    });
  }

  /**
   * Cerca un lead esistente per email o telefono.
   */
  async findExistingLead(email, phone) {
    if (!email && !phone) return null;

    return await prisma.lead.findFirst({
      where: {
        OR: [
          email ? { email } : null,
          phone ? { phone } : null,
        ].filter(Boolean),
        status: { not: 'CHIUSO' }, // Cerchiamo solo lead non ancora convertiti
      },
    });
  }

  /**
   * Converte un Lead in un Cliente e chiude il Lead.
   */
  async convertLeadToCustomer(leadId, additionalData = {}) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead non trovato');

    return await prisma.$transaction(async (tx) => {
      // 1. Crea il cliente partendo dai dati del lead
      const customer = await tx.customer.create({
        data: {
          businessName: lead.storeName,
          contactName: lead.contactName || additionalData.contactName,
          email: lead.email,
          phone: lead.phone,
          city: lead.city || additionalData.city || 'Da definire',
          region: additionalData.region || 'Da definire',
          address: additionalData.address,
          status: 'ATTIVO',
          leadId: lead.id,
          notes: `Convertito automaticamente da Lead il ${new Date().toLocaleDateString()}`,
        },
      });

      // 2. Aggiorna lo stato del Lead a CHIUSO
      await tx.lead.update({
        where: { id: lead.id },
        data: { status: 'CHIUSO' },
      });

      return customer;
    });
  }

  /**
   * Logica di matching per ordini Shopify
   */
  async handleShopifyOrder(orderData) {
    const email = orderData.email;
    const phone = orderData.phone || orderData.customer?.phone;

    // Caso A: Il cliente esiste già
    let customer = await this.findExistingCustomer(email, phone);
    if (customer) {
      console.log(`[MATCH] Ordine associato al cliente esistente: ${customer.businessName}`);
      return customer;
    }

    // Caso B: Il cliente non esiste, ma esiste un Lead
    const lead = await this.findExistingLead(email, phone);
    if (lead) {
      console.log(`[CONVERSION] Lead trovato per ${email}. Conversione in cliente in corso...`);
      return await this.convertLeadToCustomer(lead.id, {
        city: orderData.shipping_address?.city,
        region: orderData.shipping_address?.province,
        address: orderData.shipping_address?.address1,
      });
    }

    // Caso C: Non esiste nulla, creiamo il cliente direttamente (Cold Sale)
    console.log(`[NEW] Nessun lead/cliente trovato per ${email}. Creazione nuovo cliente diretto.`);
    
    const shipping = orderData.shipping_address || {};
    const billing = orderData.billing_address || {};
    const customerInfo = orderData.customer || {};

    return await prisma.customer.create({
      data: {
        businessName: shipping.company || billing.company || `Shopify: ${customerInfo.first_name || 'Cliente'} ${customerInfo.last_name || 'Generico'}`,
        contactName: `${customerInfo.first_name || ''} ${customerInfo.last_name || ''}`.trim() || 'Cliente Shopify',
        email: email || `no-email-${Date.now()}@prettylittle.it`,
        phone: phone || shipping.phone || billing.phone,
        city: shipping.city || billing.city || 'Non specificata',
        region: shipping.province || billing.province || 'Non specificata',
        address: shipping.address1 || billing.address1,
        status: 'ATTIVO',
      },
    });
  }
}

module.exports = new ConversionService();
