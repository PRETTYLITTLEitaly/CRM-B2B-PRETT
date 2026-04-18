const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.get('/users', protect, authorize('SUPER_ADMIN'), authController.getUsers);
router.post('/users', protect, authorize('SUPER_ADMIN'), authController.createUser);
router.delete('/users/:id', protect, authorize('SUPER_ADMIN'), authController.deleteUser);

module.exports = router;
