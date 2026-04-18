const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const validate = require('../middleware/validate');
const { createOrderSchema } = require('../validations/order.validation');

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.get('/stats/:customerId', orderController.getCustomerStats);
router.post('/', validate(createOrderSchema), orderController.createOrder);
router.put('/:id', orderController.updateOrder);

module.exports = router;
