const express = require('express');
const router = express.Router();

const leadRoutes = require('./lead.routes');
const orderRoutes = require('./order.routes');
const shopifyRoutes = require('./shopify.routes');
const mapRoutes = require('./map.routes');
const prospectRoutes = require('./prospect.routes');
const invoiceRoutes = require('./invoice.routes');

router.use('/leads', leadRoutes);
router.use('/orders', orderRoutes);
router.use('/webhooks/shopify', shopifyRoutes);
router.use('/maps', mapRoutes);
router.use('/find-clients', prospectRoutes);
router.use('/invoices', invoiceRoutes);

module.exports = router;
