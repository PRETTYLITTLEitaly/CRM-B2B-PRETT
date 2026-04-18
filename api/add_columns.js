const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Tentativo di aggiunta colonne P.IVA e SDI via SQL grezzo...');
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "vat_number" TEXT;
      ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "sdi_code" TEXT;
    `);
    
    console.log('✅ Colonne aggiunte con successo (o già presenti)!');
  } catch (e) {
    console.error('❌ Errore durante l\'esecuzione SQL:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
