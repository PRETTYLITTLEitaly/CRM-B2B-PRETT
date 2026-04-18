const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const validate = require('../middleware/validate');
const { createLeadSchema, updateLeadSchema } = require('../validations/lead.validation');

router.get('/', leadController.getAllLeads);
router.get('/:id', leadController.getLeadById);
router.post('/', validate(createLeadSchema), leadController.createLead);
router.put('/:id', validate(updateLeadSchema), leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

module.exports = router;
