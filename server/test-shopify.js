/**
 * Esempio di come ottenere il token con Client Credentials prima di fare la chiamata
 */
async function getAccessToken(shop, clientId, clientSecret) {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
        }),
    });
    const data = await response.json();
    return data.access_token;
}

const orderName = "#1386-WH";

async function getOrder() {
    const shop = process.env.SHOPIFY_SHOP_NAME;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
    
    console.log(`🔍 Ricerca ordine ${orderName} su ${shop}...`);
    
    try {
        const accessToken = await getAccessToken(shop, clientId, clientSecret);
        const url = `https://${shop}/admin/api/2024-01/orders.json?name=${encodeURIComponent(orderName)}&status=any`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.orders && data.orders.length > 0) {
            console.log("✅ Ordine trovato!");
            console.log("Dettagli principali:");
            console.log(`- ID: ${data.orders[0].id}`);
            console.log(`- Cliente: ${data.orders[0].customer ? data.orders[0].customer.first_name : 'N/A'}`);
            console.log(`- Totale: ${data.orders[0].total_price} ${data.orders[0].currency}`);
        } else {
            console.log("❌ Ordine non trovato o errore nei permessi.");
            console.log("Risposta Shopify:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Errore durante l'integrazione con Shopify:");
        console.error(error.message);
    }
}

getOrder();
