const { google } = require('googleapis');
const prisma = require('../config/db');

/**
 * Service per la sincronizzazione con Google Calendar.
 * Utilizza le credenziali del Service Account già impostate per Sheets.
 */
const syncOrderToCalendar = async (orderId) => {
  const { 
    GOOGLE_SERVICE_ACCOUNT_EMAIL, 
    GOOGLE_PRIVATE_KEY, 
    GOOGLE_CALENDAR_ID // ID del calendario di destinazione
  } = process.env;

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_CALENDAR_ID) {
    console.warn('[CALENDAR] Configurazione mancante.', {
      hasEmail: !!GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasKey: !!GOOGLE_PRIVATE_KEY,
      hasCalId: !!GOOGLE_CALENDAR_ID
    });
    return;
  }

  console.log(`[CALENDAR] Avvio sincronizzazione ordine #${orderId} su calendario: ...${GOOGLE_CALENDAR_ID.slice(-4)}`);

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
        date: new Date(order.deliveryDate).toISOString().split('T')[0], // Evento Tutto il giorno
      },
      end: {
        date: new Date(order.deliveryDate).toISOString().split('T')[0],
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 24 * 60 }, // 1 giorno prima
          { method: 'popup', minutes: 120 }, // 2 ore prima
        ],
      },
    };

    if (order.googleEventId) {
      // Aggiorna evento esistente
      await calendar.events.update({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId: order.googleEventId,
        resource: event,
      });
      console.log(`[CALENDAR] Evento aggiornato per ordine ${order.orderNumber}`);
    } else {
      // Crea nuovo evento
      const res = await calendar.events.insert({
        calendarId: GOOGLE_CALENDAR_ID,
        resource: event,
      });
      
      // Salva l'ID evento nel DB
      await prisma.order.update({
        where: { id: order.id },
        data: { googleEventId: res.data.id }
      });
      console.log(`[CALENDAR] Nuovo evento creato per ordine ${order.orderNumber}`);
    }

    return { success: true };
  } catch (error) {
    console.error('[CALENDAR ERROR]', {
      message: error.message,
      stack: error.stack?.split('\n')[0],
      code: error.code
    });
    return { success: false, error: error.message };
  }
};

module.exports = {
  syncOrderToCalendar,
};
