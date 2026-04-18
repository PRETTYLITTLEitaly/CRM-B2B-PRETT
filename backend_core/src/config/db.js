let PrismaClient;
try {
  ({ PrismaClient } = require('../../../api/prisma/generated/prisma/client'));
} catch (e) {
  try {
    ({ PrismaClient } = require('@prisma/client'));
  } catch (err) {
    console.error('Fatal: Cannot load PrismaClient from any standard path for version 7.', err);
  }
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
