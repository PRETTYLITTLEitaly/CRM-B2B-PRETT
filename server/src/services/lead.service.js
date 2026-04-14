const prisma = require('../config/db');

const findAll = async (filters = {}) => {
  return await prisma.lead.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
  });
};

const findById = async (id) => {
  return await prisma.lead.findUnique({
    where: { id },
    include: { customer: true },
  });
};

const create = async (data) => {
  return await prisma.lead.create({
    data,
  });
};

const update = async (id, data) => {
  return await prisma.lead.update({
    where: { id },
    data,
  });
};

const remove = async (id) => {
  return await prisma.lead.delete({
    where: { id },
  });
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
