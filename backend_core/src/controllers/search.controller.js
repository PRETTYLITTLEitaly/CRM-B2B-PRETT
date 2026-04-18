const prisma = require('../config/db');

/**
 * Ricerca Globale su Leads, Customers e Orders
 */
const globalSearch = async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json({ success: true, data: { leads: [], customers: [], orders: [] } });
  }

  try {
    const query = q.toLowerCase();

    // 1. Ricerca LEADS
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { storeName: { contains: query, mode: 'insensitive' } },
          { contactName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });

    // 2. Ricerca CUSTOMERS
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { businessName: { contains: query, mode: 'insensitive' } },
          { contactName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });

    // 3. Ricerca ORDERS
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: query, mode: 'insensitive' } },
          { id: { contains: query, mode: 'insensitive' } },
          // Se volessimo cercare per nome cliente nell'ordine dovremmo usare include
        ],
      },
      include: {
        customer: {
          select: { businessName: true }
        }
      },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        leads,
        customers,
        orders
      }
    });
  } catch (error) {
    console.error('[GLOBAL SEARCH ERROR]', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { globalSearch };
