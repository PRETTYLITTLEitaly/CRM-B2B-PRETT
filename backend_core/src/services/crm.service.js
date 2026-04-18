const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CRMService {
    async getQuickSummary() {
        try {
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

            const ordersText = recentOrders.map(o => 
                `- Ordine #${o.orderNumber} da ${o.customer?.businessName || 'N/D'} (${o.totalAmount}€)`
            ).join('\n');

            return `
                STATISTICHE REALI CRM (DATI AGGIORNATI):
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
