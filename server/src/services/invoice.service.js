const prisma = require('../config/db');

const findAll = async (params = {}) => {
  const { customerId, status, overdue } = params;
  const now = new Date();

  return await prisma.invoice.findMany({
    where: {
      ...(customerId && { customerId }),
      ...(status && { paymentStatus: status }),
      ...(overdue === 'true' && {
        paymentStatus: 'PENDENTE',
        dueDate: { lt: now },
      }),
    },
    include: {
      customer: { select: { businessName: true } }
    },
    orderBy: { invoiceDate: 'desc' },
  });
};

const create = async (data) => {
  return await prisma.invoice.create({ data });
};

const update = async (id, data) => {
  return await prisma.invoice.update({
    where: { id },
    data,
  });
};

module.exports = {
  findAll,
  create,
  update,
};
