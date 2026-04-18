const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');

router.get('/', alertController.getAlerts);

module.exports = router;
