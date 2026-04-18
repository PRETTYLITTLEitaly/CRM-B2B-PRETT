const prospectService = require('../services/prospect.service');

const getProspects = async (req, res, next) => {
  try {
    const prospects = await prospectService.findAll(req.query);
    res.json({ success: true, data: prospects });
  } catch (error) {
    next(error);
  }
};

const createProspect = async (req, res, next) => {
  try {
    const prospect = await prospectService.create(req.body);
    res.status(201).json({ success: true, data: prospect });
  } catch (error) {
    next(error);
  }
};

const updateProspect = async (req, res, next) => {
  try {
    const prospect = await prospectService.update(req.params.id, req.body);
    res.json({ success: true, data: prospect });
  } catch (error) {
    next(error);
  }
};

const convertToLead = async (req, res, next) => {
  try {
    const lead = await prospectService.convertToLead(req.params.id);
    res.json({ success: true, message: 'Prospect convertito in Lead con successo', data: lead });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProspects,
  createProspect,
  updateProspect,
  convertToLead,
};
