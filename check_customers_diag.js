const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './server/.env' });

const prisma = new PrismaClient();

async function checkDiscrepancy() {
    try {
        const shopName = process.env.SHOPIFY_SHOP_NAME;
        const accessTokenSetting = await prisma.setting.findUnique({ where: { key: 'shopify_access_token' } });
        const accessToken = accessTokenSetting?.value;

        if (!shopName || !accessToken) {
            console.error('Credenziali Shopify mancanti.');
            return;
        }

        const cleanShop = shopName.replace('https://', '').replace('.myshopify.com', '').replace(/\/$/, '') + '.myshopify.com';
        
        const shopifyUrl = `https://${cleanShop}/admin/api/2024-01/customers.json?limit=250`;
        const resp = await fetch(shopifyUrl, { headers: { 'X-Shopify-Access-Token': accessToken } });
        const data = await resp.json();
        const shopifyCustomers = data.customers || [];
        
        const crmCustomers = await prisma.customer.findMany();
        const crmEmails = new Set(crmCustomers.map(c => c.email?.toLowerCase()).filter(Boolean));
        const crmPhones = new Set(crmCustomers.map(c => c.phone).filter(Boolean));

        const missing = [];
        const merged = [];

        for (const sc of shopifyCustomers) {
            const email = sc.email?.toLowerCase();
            const phone = sc.phone || sc.default_address?.phone;
            
            if (crmEmails.has(email) || (phone && crmPhones.has(phone))) {
                merged.push(`${sc.first_name} ${sc.last_name}`);
            } else {
                missing.push(`${sc.first_name} ${sc.last_name} (${email || 'No Email'})`);
            }
        }

        console.log(`ANALISI: Shopify(${shopifyCustomers.length}) vs CRM(${crmCustomers.length})`);
        console.log(`FUSI: ${merged.length}`);
        console.log(`MANCANTI: ${missing.length}`);
        console.log('ELENCO MANCANTI:');
        missing.forEach(m => console.log(m));

    } catch (error) {
        console.error('Errore:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDiscrepancy();
