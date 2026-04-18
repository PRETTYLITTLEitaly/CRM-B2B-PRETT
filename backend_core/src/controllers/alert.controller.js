const prisma = require('../config/db');

const getAlerts = async (req, res, next) => {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // 1. Nuovi Ordini (ultime 24h)
    const newOrders = await prisma.order.findMany({
      where: { date: { gte: yesterday } },
      include: { customer: true },
      orderBy: { date: 'desc' },
      take: 5
    });

    // 2. Clienti a Rischio (Churn - nessun ordine da 30gg)
    // Nota: Prendiamo clienti attivi il cui ultimo ordine è vecchio
    const churnCandidates = await prisma.customer.findMany({
      where: { status: 'ATTIVO' },
      include: { orders: { orderBy: { date: 'desc' }, take: 1 } }
    });
    
    const churnAlerts = churnCandidates.filter(c => {
      const lastOrder = c.orders[0];
      if (!lastOrder) return true;
      return new Date(lastOrder.date) < thirtyDaysAgo;
    }).slice(0, 5);

    // 3. Consegne previste per oggi
    const todayDeliveries = await prisma.order.findMany({
      where: {
        deliveryDate: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: { customer: true },
      take: 5
    });

    // Consolidamento notifiche
    const notifications = [
      ...newOrders.map(o => ({
        id: `order-${o.id}`,
        type: 'ORDER',
        title: 'Nuovo Ordine Ricevuto',
        message: `L'ordine #${o.orderNumber || o.shopifyOrderId} da ${o.customer?.businessName || 'Cliente'} è arrivato.`,
        date: o.date,
        severity: 'info'
      })),
      ...churnAlerts.map(c => ({
        id: `churn-${c.id}`,
        type: 'CHURN',
        title: 'Rischio Abbandono',
        message: `${c.businessName} non ordina da oltre 30 giorni.`,
        date: c.orders[0]?.date || thirtyDaysAgo,
        severity: 'warning'
      })),
      ...todayDeliveries.map(o => ({
        id: `delivery-${o.id}`,
        type: 'DELIVERY',
        title: 'Consegna in Programma',
        message: `Oggi prevista consegna per ${o.customer?.businessName}.`,
        date: o.deliveryDate,
        severity: 'success'
      }))
    ].sort((a,b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        notifications,
        count: notifications.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts };
