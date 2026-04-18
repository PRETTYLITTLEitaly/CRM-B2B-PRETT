const { google } = require('googleapis');
const prisma = require('../config/db');

/**
 * Service per la sincronizzazione con Google Calendar.
 */
const syncOrderToCalendar = async (orderId) => {
  const { 
    GOOGLE_SERVICE_ACCOUNT_EMAIL, 
    GOOGLE_PRIVATE_KEY, 
    GOOGLE_CALENDAR_ID
  } = process.env;

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_CALENDAR_ID) {
    console.warn('[CALENDAR] Configurazione mancante.');
    return;
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true }
    });

    if (!order || !order.deliveryDate) return;

    const auth = new google.auth.JWT(
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/calendar']
    );

    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: `🚚 Consegna: ${order.customer?.businessName || 'Cliente'} - Ordine #${order.orderNumber}`,
      description: `
📦 Totale Ordine: €${parseFloat(order.totalAmount).toLocaleString()}
👥 Cliente: ${order.customer?.businessName}
✉️ Email: ${order.customer?.email}
📞 Telefono: ${order.customer?.phone}
📍 Luogo: ${order.customer?.city}, ${order.customer?.region}
🔗 Link CRM: https://app.wholesale-prettylittle.it/orders
      `.trim(),
      start: {
        date: new Date(order.deliveryDate).toISOString().split('T')[0],
      },
      end: {
        date: new Date(order.deliveryDate).toISOString().split('T')[0],
      },
    };

    if (order.googleEventId) {
      await calendar.events.update({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId: order.googleEventId,
        resource: event,
      });
    } else {
      const res = await calendar.events.insert({
        calendarId: GOOGLE_CALENDAR_ID,
        resource: event,
      });
      
      await prisma.order.update({
        where: { id: order.id },
        data: { googleEventId: res.data.id }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[CALENDAR ERROR]', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  syncOrderToCalendar,
};
