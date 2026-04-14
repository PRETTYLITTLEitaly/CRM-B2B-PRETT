const express = require('express');
const router = express.Router();
const prospectController = require('../controllers/prospect.controller');

router.get('/', prospectController.getProspects);
router.post('/', prospectController.createProspect);
router.put('/:id', prospectController.updateProspect);
router.post('/:id/convert', prospectController.convertToLead);

module.exports = router;
