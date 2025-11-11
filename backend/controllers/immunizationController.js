const Immunization = require('../models/Immunization');
const { validationResult } = require('express-validator');

// Get all immunizations
exports.getImmunizations = async (req, res) => {
  try {
    const { patientId, status } = req.query;
    let query = {};

    if (patientId) {
      query.patient = patientId;
    }

    if (status) {
      query.status = status;
    }

    const immunizations = await Immunization.find(query)
      .populate('patient', 'name dateOfBirth')
      .populate('administeredBy', 'name role')
      .sort({ dateAdministered: -1 });

    res.status(200).json({ success: true, count: immunizations.length, data: immunizations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single immunization
exports.getImmunization = async (req, res) => {
  try {
    const immunization = await Immunization.findById(req.params.id)
      .populate('patient')
      .populate('administeredBy', 'name role');

    if (!immunization) {
      return res.status(404).json({ message: 'Immunization record not found' });
    }

    res.status(200).json({ success: true, data: immunization });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create immunization record
exports.createImmunization = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only doctors and nurses can administer vaccines
    if (!['Doctor', 'Nurse'].includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Only doctors and nurses are authorized to administer vaccines' 
      });
    }

    req.body.administeredBy = req.user.id;

    const immunization = await Immunization.create(req.body);
    const populated = await immunization.populate('patient administeredBy');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update immunization record
exports.updateImmunization = async (req, res) => {
  try {
    // Only doctors and nurses can update immunization records
    if (!['Doctor', 'Nurse'].includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Only doctors and nurses are authorized to update immunization records' 
      });
    }

    const immunization = await Immunization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patient administeredBy');

    if (!immunization) {
      return res.status(404).json({ message: 'Immunization record not found' });
    }

    res.status(200).json({ success: true, data: immunization });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete immunization record
exports.deleteImmunization = async (req, res) => {
  try {
    const immunization = await Immunization.findByIdAndDelete(req.params.id);

    if (!immunization) {
      return res.status(404).json({ message: 'Immunization record not found' });
    }

    res.status(200).json({ success: true, message: 'Immunization record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get overdue immunizations
exports.getOverdueImmunizations = async (req, res) => {
  try {
    const today = new Date();
    const immunizations = await Immunization.find({
      nextDueDate: { $lt: today },
      status: { $ne: 'Completed' }
    })
      .populate('patient', 'name contactNumber')
      .populate('administeredBy', 'name');

    res.status(200).json({ success: true, count: immunizations.length, data: immunizations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
