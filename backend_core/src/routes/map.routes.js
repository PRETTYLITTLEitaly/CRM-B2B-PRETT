const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const geocodingService = require('../services/geocoding.service');

// Ottiene tutti i punti sulla mappa (Customer + Lead)
router.get('/points', async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        businessName: true,
        city: true,
        region: true,
        lat: true,
        lng: true,
        status: true,
        address: true,
        country: true
      }
    });

    const leads = await prisma.lead.findMany({
      select: {
        id: true,
        storeName: true,
        city: true,
        region: true,
        lat: true,
        lng: true,
        status: true,
        address: true,
        country: true
      }
    });

    // Uniamo i dati con un flag per distinguerli
    const points = [
      ...customers.map(c => ({ 
        ...c, 
        name: c.businessName, 
        type: 'CUSTOMER', 
        markerColor: c.status === 'ATTIVO' ? 'emerald' : c.status === 'INATTIVO' ? 'rose' : 'amber' 
      })),
      ...leads.map(l => ({ 
        ...l, 
        name: l.storeName, 
        type: 'LEAD', 
        markerColor: 'indigo' 
      }))
    ];

    // Proviamo a geocodificare quelli che mancano in background
    points.filter(p => !p.lat).forEach(p => {
      if (p.type === 'CUSTOMER') geocodingService.updateCustomerCoordinates(p.id);
      else geocodingService.updateLeadCoordinates(p.id);
    });

    res.json({ success: true, data: points });
  } catch (error) {
    next(error);
  }
});

// Statistiche puntuali per regione
router.get('/stats', async (req, res, next) => {
  try {
    const customersByRegion = await prisma.customer.groupBy({
      by: ['region'],
      _count: { id: true }
    });
    res.json({ success: true, data: customersByRegion });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
