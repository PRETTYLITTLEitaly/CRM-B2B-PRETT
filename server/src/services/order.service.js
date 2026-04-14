const prisma = require('../config/db');

const findAll = async (params = {}) => {
  const { customerId, skip, take } = params;
  return await prisma.order.findMany({
    where: {
      ...(customerId && { customerId }),
    },
    include: {
      customer: {
        select: { businessName: true, email: true }
      }
    },
    orderBy: { date: 'desc' },
    skip: skip ? parseInt(skip) : undefined,
    take: take ? parseInt(take) : undefined,
  });
};

const findById = async (id) => {
  return await prisma.order.findUnique({
    where: { id },
    include: { customer: true },
  });
};

const create = async (data) => {
  return await prisma.order.create({
    data,
  });
};

const update = async (id, data) => {
  return await prisma.order.update({
    where: { id },
    data,
  });
};

const getStatsByCustomer = async (customerId) => {
  const aggregate = await prisma.order.aggregate({
    where: { customerId },
    _sum: { totalAmount: true },
    _count: { id: true },
    _avg: { totalAmount: true }
  });

  return {
    totalRevenue: aggregate._sum.totalAmount || 0,
    orderCount: aggregate._count.id || 0,
    averageTicket: aggregate._avg.totalAmount || 0,
  };
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  getStatsByCustomer,
};
