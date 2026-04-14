const { google } = require('googleapis');
const prisma = require('../config/db');

/**
 * Funzione per sincronizzare i Lead da Google Sheets.
 * Richiede un file di credenziali Service Account configurato.
 */
const syncLeadsFromSheets = async () => {
  const { GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env;

  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.warn('[GOOGLE SHEETS] Configurazione mancante. Salto il sync.');
    return;
  }

  try {
    const auth = new google.auth.JWT(
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Leggiamo i dati dal range specificato (es: Foglio1!A:F)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'A2:F100', // Assumiamo riga 1 sia l'intestazione
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('[GOOGLE SHEETS] Nessun dato trovato nel foglio.');
      return;
    }

    let createdCount = 0;
    for (const row of rows) {
      const [storeName, contactName, phone, email, city, source] = row;

      // Upsert basato sull'email per evitare duplicati
      if (email) {
        await prisma.lead.upsert({
          where: { email },
          update: {
            storeName,
            contactName,
            phone,
            city,
            source: source || 'Google Sheets',
          },
          create: {
            storeName,
            contactName,
            phone,
            email,
            city,
            source: source || 'Google Sheets',
            status: 'NUOVO',
          },
        });
        createdCount++;
      }
    }

    console.log(`[GOOGLE SHEETS] Sync completato: ${createdCount} lead elaborati.`);
    return { success: true, count: createdCount };
  } catch (error) {
    console.error('[GOOGLE SHEETS ERROR]', error.message);
    throw new Error('Errore durante la sincronizzazione Google Sheets');
  }
};

module.exports = {
  syncLeadsFromSheets,
};
