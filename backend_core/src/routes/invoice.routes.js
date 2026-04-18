const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const validate = require('../middleware/validate');
const { createInvoiceSchema, updateInvoiceSchema } = require('../validations/invoice.validation');

router.get('/', invoiceController.getInvoices);
router.post('/', validate(createInvoiceSchema), invoiceController.createInvoice);
router.put('/:id', validate(updateInvoiceSchema), invoiceController.updateInvoice);

module.exports = router;
