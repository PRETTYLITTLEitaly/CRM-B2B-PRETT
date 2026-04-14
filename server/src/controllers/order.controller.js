const orderService = require('../services/order.service');

const getOrders = async (req, res, next) => {
  try {
    const { customerId, skip, take } = req.query;
    const orders = await orderService.findAll({ customerId, skip, take });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Ordine non trovato' });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getCustomerStats = async (req, res, next) => {
  try {
    const stats = await orderService.getStatsByCustomer(req.params.customerId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  getCustomerStats,
};
