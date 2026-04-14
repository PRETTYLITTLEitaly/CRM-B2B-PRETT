const Joi = require('joi');

const createInvoiceSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  invoiceNumber: Joi.string().required(),
  invoiceDate: Joi.date().required(),
  due_date: Joi.date().greater(Joi.ref('invoiceDate')).allow(null),
  totalAmount: Joi.number().precision(2).required(),
  paymentStatus: Joi.string().valid('PAGATA', 'PENDENTE', 'ANNULLATA').default('PENDENTE'),
  paymentDate: Joi.date().allow(null),
  notes: Joi.string().allow('', null),
});

const updateInvoiceSchema = Joi.object({
  paymentStatus: Joi.string().valid('PAGATA', 'PENDENTE', 'ANNULLATA'),
  paymentDate: Joi.date().allow(null),
  notes: Joi.string().allow('', null),
}).min(1);

module.exports = {
  createInvoiceSchema,
  updateInvoiceSchema,
};
