const Joi = require('joi');

const createOrderSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  shopifyOrderId: Joi.string().allow('', null),
  orderNumber: Joi.string().required(),
  totalAmount: Joi.number().precision(2).required(),
  date: Joi.date().required(),
  currency: Joi.string().default('EUR'),
  paymentStatus: Joi.string().allow('', null),
  fulfillmentStatus: Joi.string().allow('', null),
  productsJson: Joi.alternatives().try(Joi.array(), Joi.object()).allow(null),
});

const updateOrderSchema = Joi.object({
  paymentStatus: Joi.string(),
  fulfillmentStatus: Joi.string(),
  totalAmount: Joi.number().precision(2),
  notes: Joi.string().allow('', null),
}).min(1);

module.exports = {
  createOrderSchema,
  updateOrderSchema,
};
