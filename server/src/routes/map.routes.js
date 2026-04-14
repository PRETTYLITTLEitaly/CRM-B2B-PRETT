const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

router.get('/customers', async (req, res, next) => {
  try {
    const { region, city } = req.query;
    const customers = await prisma.customer.findMany({
      where: {
        ...(region && { region }),
        ...(city && { city }),
      },
      select: {
        id: true,
        businessName: true,
        city: true,
        region: true,
        manualLatitude: true,
        manualLongitude: true,
        status: true
      }
    });
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
