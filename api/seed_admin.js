const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'info@prettylittle.it';
  const plainPassword = '---'; // Placeholder, I'll use the user's provided pass if I could read it
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        name: 'Luca Vitale'
      },
      create: {
        email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        name: 'Luca Vitale'
      }
    });
    console.log('✅ Utente Super Admin creato/aggiornato:', user.email);
  } catch (err) {
    console.error('❌ Errore creazione utente:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
