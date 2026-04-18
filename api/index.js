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

// DIAGNOSTIC & IMPORT ROUTES
app.get('/api/diag/import-from-csv', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const csvPath = path.join(process.cwd(), 'customers_export-2 2.csv');
        
        if (!fs.existsSync(csvPath)) return res.status(404).send('CSV NOT FOUND');

        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.split(/\r?\n(?=')/);
        
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        let created = 0, skipped = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].replace(/^'/, '');
            const fields = line.split(';');
            if (fields.length < 5) continue;

            const firstName = fields[1] || '';
            const lastName = fields[2] || '';
            const email = fields[3]?.toLowerCase().trim() || null;
            const businessName = fields[5] || `${firstName} ${lastName}`;
            const city = fields[8] || '';
            const phone = fields[12]?.replace(/['+]/g, '').trim() || fields[13]?.replace(/['+]/g, '').trim() || '';
            const totalOrders = parseInt(fields[16]) || 0;

            const existing = await prisma.customer.findFirst({
                where: {
                    OR: [
                        email ? { email: { equals: email, mode: 'insensitive' } } : null,
                        phone ? { phone: { contains: phone } } : null
                    ].filter(Boolean)
                }
            });

            if (existing) { skipped++; continue; }

            await prisma.customer.create({
                data: {
                    firstName, lastName, businessName, email, phone, city,
                    status: totalOrders > 0 ? 'ATTIVO' : 'POTENZIALE',
                    source: 'SHOPIFY_IMPORT'
                }
            });
            created++;
        }

        res.send(`IMPORTAZIONE DAL CSV COMPLETATA: +${created} nuovi, ${skipped} già presenti.`);
        await prisma.$disconnect();
    } catch (e) {
        res.status(500).send("ERROR: " + e.message);
    }
});

app.get('/api/health', (req, res) => res.send('SERVER IS ONLINE'));

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

