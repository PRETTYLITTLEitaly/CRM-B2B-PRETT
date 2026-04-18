const prisma = require('../config/db');

const findAll = async (params = {}) => {
  const { city, region, status, search, sortBy = 'createdAt', order = 'desc' } = params;
  
  return await prisma.prospectFinder.findMany({
    where: {
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(region && { region: { contains: region, mode: 'insensitive' } }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { [sortBy]: order },
  });
};

const create = async (data) => {
  return await prisma.prospectFinder.create({ data });
};

const update = async (id, data) => {
  return await prisma.prospectFinder.update({
    where: { id },
    data,
  });
};

/**
 * Converte un Prospect in un Lead
 */
const convertToLead = async (id) => {
  const prospect = await prisma.prospectFinder.findUnique({ where: { id } });
  if (!prospect) throw new Error('Prospect non trovato');

  return await prisma.$transaction(async (tx) => {
    // 1. Crea il Lead
    const lead = await tx.lead.create({
      data: {
        storeName: prospect.businessName,
        city: prospect.city,
        phone: prospect.phone,
        email: prospect.email,
        source: prospect.source || 'Prospect Finder',
        status: 'NUOVO',
      },
    });

    // 2. Aggiorna lo stato del Prospect
    await tx.prospectFinder.update({
      where: { id },
      data: { status: 'CONVERTITO_LEAD' },
    });

    return lead;
  });
};

module.exports = {
  findAll,
  create,
  update,
  convertToLead,
};
