const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mainRouter = require('../backend_core/src/routes');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// SYNC FULL LOGIC (Inlined for Vercel stability)
async function runFullSync() {
    const shopName = process.env.SHOPIFY_SHOP_NAME;
    const setting = await prisma.setting.findUnique({ where: { key: 'shopify_access_token' } });
    const accessToken = setting?.value;
    
    if (!shopName || !accessToken) throw new Error('Missing Shopify credentials');

    const cleanShop = shopName.replace('https://', '').replace('.myshopify.com', '').replace(/\/$/, '') + '.myshopify.com';
    
    // 1. Get Shopify Customers
    const cResp = await fetch(`https://${cleanShop}/admin/api/2024-01/customers.json?limit=250`, { headers: { 'X-Shopify-Access-Token': accessToken } });
    const cData = await cResp.json();
    const shopifyCustomers = cData.customers || [];

    const existing = await prisma.customer.findMany({ select: { email: true, phone: true } });
    const existingEmails = new Set(existing.map(e => e.email?.toLowerCase()).filter(Boolean));
    const existingPhones = new Set(existing.map(e => e.phone).filter(Boolean));

    let created = 0;
    for (const sc of shopifyCustomers) {
        const email = sc.email?.toLowerCase().trim() || null;
        
        // NORMALIZZAZIONE TELEFONO
        let rawPhone = sc.phone || sc.default_address?.phone;
        let phone = rawPhone ? rawPhone.replace(/[^0-9+]/g, '') : null;
        if (phone === '') phone = null;

        if ((email && existingEmails.has(email)) || (phone && existingPhones.has(phone))) continue;

        await prisma.customer.create({
            data: {
                businessName: sc.default_address?.company || `${sc.first_name || ''} ${sc.last_name || ''}`.trim() || 'Shopify Client',
                contactName: `${sc.first_name || ''} ${sc.last_name || ''}`.trim(),
                email: email,
                phone: phone,
                city: sc.default_address?.city || 'N/A',
                region: sc.default_address?.province || 'N/A',
                address: sc.default_address?.address1,
                status: 'INATTIVO'
            }
        });
        
        if (email) existingEmails.add(email);
        if (phone) existingPhones.add(phone);
        
        created++;
    }

    // 2. Trigger Order Sync
    const { syncOrders } = require('../backend_core/src/services/shopify.service');
    const orderResult = await syncOrders();

    return { 
        success: true, 
        newCustomers: created, 
        syncedOrdersAndDrafts: orderResult.count,
        details: `Importazione completata: ${created} nuovi clienti aggiunti. Sincronizzati ${orderResult.count} tra ordini reali e bozze aperte.`
    };
}

app.get('/api/diag/sync-full', async (req, res) => {
    try {
        const result = await runFullSync();
        res.json(result);
    } catch (e) {
        res.status(500).send("SYNC ERROR: " + e.message + "\n" + e.stack);
    }
});

app.get('/api/health', (req, res) => res.send('SERVER IS ONLINE'));

// MAIN API ROUTER
app.use('/api', mainRouter);

// EXPORT FOR VERCEL
module.exports = app;
