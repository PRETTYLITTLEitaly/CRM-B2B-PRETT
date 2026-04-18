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

// DIAGNOSTIC ROUTES
app.get('/api/health', (req, res) => res.send('SERVER IS ONLINE'));
app.get('/api/test', (req, res) => res.send('ROUTER TEST OK'));

// GENERATE REPORT ON REFRESH
app.get('/api/diag/analysis-v2', async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const shopName = process.env.SHOPIFY_SHOP_NAME;
        const accessTokenSetting = await prisma.setting.findUnique({ where: { key: 'shopify_access_token' } });
        const accessToken = accessTokenSetting?.value;

        const shopifyUrl = `https://${shopName.replace('https://', '').replace('.myshopify.com', '')}.myshopify.com/admin/api/2024-01/customers.json?limit=250`;
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
                merged.push(`${sc.first_name || ''} ${sc.last_name || ''}`);
            } else {
                missing.push(`${sc.first_name || ''} ${sc.last_name || ''} (${email || 'No Email'})`);
            }
        }

        const report = `DIAGNOSI COMPLETATA. 
        Shopify: ${shopifyCustomers.length} schede. 
        CRM: ${crmCustomers.length} clienti.
        
        FUSI (Duplicati/Match): ${merged.length}
        MANCANTI (Mai importati): ${missing.length}
        
        ELENCO MANCANTI: \n- ${missing.join('\n- ')}`;

        res.send(`<pre>${report}</pre>`);
        await prisma.$disconnect();
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// INITIALIZATION ROUTE (Self-healing DB)
app.get('/api/init', async (req, res) => {
  try {
    // 1. Assicura l'enum UserRole
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
          CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Assicura la tabella User con i nuovi campi
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "firstName" TEXT,
          "lastName" TEXT,
          "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    // Migrazione: se la colonna "name" esiste ancora (legacy), aggiungiamo le nuove se mancano
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;');
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;');
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commission_rate" DOUBLE PRECISION DEFAULT 0;');
    } catch (err) {
      console.log('Colonne già presenti o errore in aggiunta:', err);
    }

    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "commission_enabled" BOOLEAN DEFAULT true;');
      await prisma.$executeRawUnsafe('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discounts_json" JSONB;');
    } catch (err) {
      console.log('Colonne aggiuntive già presenti o errore:', err);
    }

    // 3. Assicura l'indice
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);

    const email = 'info@prettylittle.it';
    const exists = await prisma.user.findUnique({ where: { email } });
    if (!exists) {
      const hashedPassword = await bcrypt.hash('---', 10);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Luca',
          lastName: 'Vitale',
          role: 'SUPER_ADMIN'
        }
      });
      return res.json({ success: true, message: 'Database aggiornato e Admin Luca Vitale creato' });
    } else {
      // Aggiorna admin esistente con i campi separati se necessario
      await prisma.user.update({
        where: { email },
        data: { firstName: 'Luca', lastName: 'Vitale' }
      });
    }
    res.json({ success: true, message: 'Database già pronto con firstName/lastName' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, stack: e.stack });
  }
});

// MAIN API ROUTER
app.use('/api', mainRouter);

// EXPORT FOR VERCEL
module.exports = app;

