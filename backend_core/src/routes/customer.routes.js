const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { geocodeAddress } = require('../services/geocoding.service');

// Ottieni tutti i clienti
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { businessName: 'asc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aggiorna un cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const b = req.body;
  
  try {
    // Se cambiano i dati geografici, ricalcola coordinate
    let lat = undefined, lng = undefined;
    if (b.address || b.city || b.country) {
      const coords = await geocodeAddress(b.address, b.city, b.region, b.country);
      if (coords) { lat = coords.lat; lng = coords.lng; }
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(b.businessName && { businessName: b.businessName }),
        ...(b.contactName && { contactName: b.contactName }),
        ...(b.email && { email: b.email }),
        ...(b.phone && { phone: b.phone }),
        ...(b.city && { city: b.city }),
        ...(b.region && { region: b.region }),
        ...(b.address && { address: b.address }),
        ...(b.country && { country: b.country }),
        ...(b.notes && { notes: b.notes }),
        ...(b.status && { status: b.status }),
        ...(lat !== undefined && { lat }),
        ...(lng !== undefined && { lng })
      },
      include: {
        orders: true,
        _count: { select: { orders: true } }
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Elimina un cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.customer.delete({ where: { id } });
    res.json({ success: true, message: 'Cliente rimosso dal CRM' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
