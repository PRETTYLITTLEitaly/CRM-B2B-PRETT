const express = require('express');
const router = express.Router();
const shopifyController = require('../controllers/shopify.controller');

// Questa è la rotta da configurare nel pannello Admin di Shopify (Webhooks)
router.post('/orders', shopifyController.handleWebhook);

module.exports = router;
