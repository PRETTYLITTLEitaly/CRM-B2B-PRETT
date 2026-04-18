const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CRMService {
    async getQuickSummary() {
        try {
            const [orderCount, customerCount, leadCount, recentOrders] = await prisma.$transaction([
                prisma.order.count(),
                prisma.customer.count(),
                prisma.lead.count(),
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
            `;
        } catch (error) {
            console.error('Error fetching CRM summary:', error);
            return 'Dati CRM non disponibili al momento.';
        }
    }
}

module.exports = new CRMService();
