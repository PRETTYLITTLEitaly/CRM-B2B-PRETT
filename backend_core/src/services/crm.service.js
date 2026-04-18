const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CRMService {
    async getQuickSummary(searchQuery = null) {
        const shopName = process.env.SHOPIFY_SHOP_NAME;
        const accessTokenSetting = await prisma.setting.findUnique({ where: { key: 'shopify_access_token' } });
        const accessToken = accessTokenSetting?.value;

        try {
            // DIAGNOSTIC CORE: Sync Discrepancy Analysis
            if (searchQuery && searchQuery.toLowerCase().includes('analizza discrepanza')) {
                const shopifyUrl = `https://${shopName.replace('https://', '').replace('.myshopify.com', '')}.myshopify.com/admin/api/2024-01/customers.json?limit=250`;
                const resp = await axios.get(shopifyUrl, { headers: { 'X-Shopify-Access-Token': accessToken } });
                const shopifyCustomers = resp.data.customers || [];
                
                const crmCustomers = await prisma.customer.findMany();
                const crmEmails = new Set(crmCustomers.map(c => c.email?.toLowerCase()).filter(Boolean));
                const crmPhones = new Set(crmCustomers.map(c => c.phone).filter(Boolean));

                const missing = [];
                const merged = [];

                for (const sc of shopifyCustomers) {
                    const email = sc.email?.toLowerCase();
                    const phone = sc.phone || sc.default_address?.phone;
                    if (crmEmails.has(email) || (phone && crmPhones.has(phone))) {
                        merged.push((sc.first_name || '') + ' ' + (sc.last_name || ''));
                    } else {
                        missing.push((sc.first_name || '') + ' ' + (sc.last_name || ''));
                    }
                }

                return `DIAGNOSI COMPLETATA. 
                Shopify: ${shopifyCustomers.length} schede. 
                CRM: ${crmCustomers.length} clienti.
                
                FUSI (Duplicati/Match): ${merged.length}
                MANCANTI (Mai importati): ${missing.length}
                
                ELENCO MANCANTI: ${missing.slice(0, 20).join(', ')} ${missing.length > 20 ? '...' : ''}`;
            }

            const [orderCount, customerCount, leadCount, recentOrders] = await prisma.$transaction([
                prisma.order.count(),
                prisma.customer.count(),
                prisma.lead.count(),
                prisma.order.findMany({
                    take: 5,
                    orderBy: { date: 'desc' },
                    include: { customer: true }
                })
            ]);

            let searchResultsText = '';
            if (searchQuery && searchQuery.length > 2) {
                const results = await prisma.customer.findMany({
                    where: { businessName: { contains: searchQuery, mode: 'insensitive' } },
                    take: 3,
                    include: { orders: { take: 5, orderBy: { date: 'desc' } } }
                });

                if (results.length > 0) {
                    searchResultsText = "\n\nRISULTATI RICERCA SPECIFICA:\n" + results.map(c => 
                        `Cliente: ${c.businessName}\nCittà: ${c.city}\nOrdini recenti: ${c.orders.map(o => `#${o.orderNumber} del ${new Date(o.date).toLocaleDateString('it-IT')} (${o.totalAmount}€)`).join(', ')}`
                    ).join('\n---\n');
                }
            }

            const ordersText = recentOrders.map(o => {
                const orderDate = new Date(o.date).toLocaleDateString('it-IT');
                return `- Ordine #${o.orderNumber} del ${orderDate} da ${o.customer?.businessName || 'N/D'} (${o.totalAmount}€)`;
            }).join('\n');

            const now = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });

            return `
                DATA/ORA ATTUALE (ROMA): ${now}
                
                STATISTICHE REALI CRM:
                - Totale Ordini: ${orderCount}
                - Totale Clienti: ${customerCount}
                - Totale Lead: ${leadCount}
                
                ULTIMI 5 ORDINI:
                ${ordersText || 'Nessun ordine recente.'}

                ${searchResultsText}
            `;
        } catch (error) {
            console.error('Error fetching CRM summary:', error);
            return 'Dati CRM non disponibili al momento.';
        }
    }
}

module.exports = new CRMService();
