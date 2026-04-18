const Joi = require('joi');

const createLeadSchema = Joi.object({
  storeName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Il nome del negozio è obbligatorio',
  }),
  contactName: Joi.string().allow('', null),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null).messages({
    'string.email': 'Formato email non valido',
  }),
  city: Joi.string().allow('', null),
  source: Joi.string().allow('', null),
  status: Joi.string().valid('NUOVO', 'CONTATTATO', 'TRATTATIVA', 'CHIUSO').default('NUOVO'),
  notes: Joi.string().allow('', null),
});

const updateLeadSchema = Joi.object({
  storeName: Joi.string().min(2).max(100),
  contactName: Joi.string().allow('', null),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  city: Joi.string().allow('', null),
  source: Joi.string().allow('', null),
  status: Joi.string().valid('NUOVO', 'CONTATTATO', 'TRATTATIVA', 'CHIUSO'),
  notes: Joi.string().allow('', null),
}).min(1); // Almeno un campo deve essere presente per l'aggiornamento

module.exports = {
  createLeadSchema,
  updateLeadSchema,
};
