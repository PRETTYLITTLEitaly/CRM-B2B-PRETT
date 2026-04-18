const prisma = require('../config/db');
const conversionService = require('./conversion.service');

/**
 * Servizio dedicato alla riconciliazione totale Shopify <-> CRM
 */
const fullReconciliation = async () => {
  try {
    const shopName = process.env.SHOPIFY_SHOP_NAME;
    const setting = await prisma.setting.findUnique({ where: { key: 'shopify_access_token' } });
    const accessToken = setting?.value;
    
    if (!shopName || !accessToken) throw new Error('Credenziali Shopify mancanti nel database');

    const cleanShop = shopName.replace('https://', '').replace('.myshopify.com', '').replace(/\/$/, '') + '.myshopify.com';
    
    console.log(`[RECONCILIATION] Avvio sincronizzazione totale per ${cleanShop}`);

    // 1. SCANSIONE CLIENTI SHOPIFY (Per trovare chi manca del tutto)
    const customerUrl = `https://${cleanShop}/admin/api/2024-01/customers.json?limit=250`;
    const cResp = await fetch(customerUrl, { headers: { 'X-Shopify-Access-Token': accessToken } });
    const cData = await cResp.json();
    const shopifyCustomers = cData.customers || [];

    // Carichiamo email e telefoni esistenti per lookup veloce
    const existing = await prisma.customer.findMany({ select: { email: true, phone: true } });
    const existingEmails = new Set(existing.map(e => e.email?.toLowerCase()).filter(Boolean));
    const existingPhones = new Set(existing.map(e => e.phone).filter(Boolean));

    let newCustomersCount = 0;

    for (const sc of shopifyCustomers) {
      const email = sc.email?.toLowerCase().trim();
      const phone = sc.phone || sc.default_address?.phone;
      
      if ((email && existingEmails.has(email)) || (phone && existingPhones.has(phone))) {
        continue; // Già presente
      }

      // NUOVO CLIENTE SENZA ORDINI (Label iniziale INATTIVO)
      await prisma.customer.create({
        data: {
          businessName: sc.default_address?.company || `${sc.first_name || ''} ${sc.last_name || ''}`.trim() || 'Cliente Shopify',
          contactName: `${sc.first_name || ''} ${sc.last_name || ''}`.trim(),
          email: email,
          phone: phone,
          city: sc.default_address?.city || 'Non specificata',
          region: sc.default_address?.province || 'Non specificata',
          address: sc.default_address?.address1,
          status: 'INATTIVO' // Partiamo col tag rosso
        }
      });
      newCustomersCount++;
    }

    console.log(`[RECONCILIATION] Aggiunti ${newCustomersCount} clienti mancanti come INATTIVI`);

    // 2. SCANSIONE ORDINI E BOZZE (Per attivare i clienti e caricare dati finanziari)
    const { syncOrders } = require('./shopify.service');
    const syncResult = await syncOrders();

    return {
      success: true,
      newCustomers: newCustomersCount,
      syncedOrders: syncResult.count,
      message: `Riconciliazione completata: +${newCustomersCount} clienti, ${syncResult.count} ordini/bozze aggiornati.`
    };

  } catch (error) {
    console.error('[RECONCILIATION ERROR]', error);
    throw error;
  }
};

module.exports = { fullReconciliation };
