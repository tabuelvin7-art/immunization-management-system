const Vaccine = require('../models/Vaccine');
const { validationResult } = require('express-validator');

// Get all vaccines
exports.getVaccines = async (req, res) => {
  try {
    const vaccines = await Vaccine.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: vaccines.length, data: vaccines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single vaccine
exports.getVaccine = async (req, res) => {
  try {
    const vaccine = await Vaccine.findById(req.params.id);

    if (!vaccine) {
      return res.status(404).json({ message: 'Vaccine not found' });
    }

    res.status(200).json({ success: true, data: vaccine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create vaccine
exports.createVaccine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vaccine = await Vaccine.create(req.body);
    res.status(201).json({ success: true, data: vaccine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update vaccine
exports.updateVaccine = async (req, res) => {
  try {
    const vaccine = await Vaccine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vaccine) {
      return res.status(404).json({ message: 'Vaccine not found' });
    }

    res.status(200).json({ success: true, data: vaccine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete vaccine (soft delete)
exports.deleteVaccine = async (req, res) => {
  try {
    const vaccine = await Vaccine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!vaccine) {
      return res.status(404).json({ message: 'Vaccine not found' });
    }

    res.status(200).json({ success: true, message: 'Vaccine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get low stock vaccines
exports.getLowStockVaccines = async (req, res) => {
  try {
    const vaccines = await Vaccine.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    });

    res.status(200).json({ success: true, count: vaccines.length, data: vaccines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
