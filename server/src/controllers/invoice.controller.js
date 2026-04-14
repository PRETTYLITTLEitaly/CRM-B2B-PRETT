const invoiceService = require('../services/invoice.service');

const getInvoices = async (req, res, next) => {
  try {
    const invoices = await invoiceService.findAll(req.query);
    res.json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.create(req.body);
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.update(req.params.id, req.body);
    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  updateInvoice,
};
