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

// IMPORT FROM CSV (LOGICA SEPARATA)
app.get('/api/diag/import-from-csv', async (req, res) => {
    try {
        const { importData } = require('./import_data');
        await importData(prisma, res);
    } catch (e) {
        res.status(500).send("ERROR: " + e.message);
    }
});

// INITIALIZATION ROUTE (Fondamentale per la struttura del tuo DB)
app.get('/api/init', async (req, res) => {
  try {
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
          CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

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

    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;');
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;');
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commission_rate" DOUBLE PRECISION DEFAULT 0;');
    } catch (err) {}

    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "commission_enabled" BOOLEAN DEFAULT true;');
      await prisma.$executeRawUnsafe('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discounts_json" JSONB;');
    } catch (err) {}

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);

    res.json({ success: true, message: 'Database pronto' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// MAIN API ROUTER (Mounting /api per compatibilità frontend)
app.use('/api', mainRouter);

// EXPORT FOR VERCEL (OBBLIGATORIO PER EVITARE ERRORI DI CONNESSIONE)
module.exports = app;
