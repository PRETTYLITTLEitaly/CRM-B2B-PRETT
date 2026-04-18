const leadService = require('../services/lead.service');
const asyncHandler = require('../middleware/async');
const { sendResponse } = require('../utils/response');

// @desc    Ottieni tutti i lead
// @route   GET /api/leads
const getAllLeads = asyncHandler(async (req, res) => {
  const leads = await leadService.findAll();
  sendResponse(res, 200, leads);
});

// @desc    Ottieni singolo lead
// @route   GET /api/leads/:id
const getLeadById = asyncHandler(async (req, res) => {
  const lead = await leadService.findById(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead non trovato' });
  sendResponse(res, 200, lead);
});

// @desc    Crea nuovo lead
// @route   POST /api/leads
const createLead = asyncHandler(async (req, res) => {
  const lead = await leadService.create(req.body);
  sendResponse(res, 201, lead, 'Lead creato correttamente');
});

// @desc    Aggiorna lead
// @route   PUT /api/leads/:id
const updateLead = asyncHandler(async (req, res) => {
  const lead = await leadService.update(req.params.id, req.body);
  sendResponse(res, 200, lead, 'Lead aggiornato');
});

// @desc    Elimina lead
// @route   DELETE /api/leads/:id
const deleteLead = asyncHandler(async (req, res) => {
  await leadService.remove(req.params.id);
  sendResponse(res, 200, null, 'Lead eliminato');
});

module.exports = {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
};
