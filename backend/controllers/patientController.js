const Patient = require('../models/Patient');
const VerificationCode = require('../models/VerificationCode');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// Get all patients
exports.getPatients = async (req, res) => {
  try {
    const { search, gender } = req.query;
    let query = { isActive: true };

    // If user is a parent, only show their children
    if (req.user.role === 'Parent') {
      query.parentUser = req.user.id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (gender) {
      query.gender = gender;
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single patient
exports.getPatient = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If user is a parent, only allow access to their children
    if (req.user.role === 'Parent') {
      query.parentUser = req.user.id;
    }

    const patient = await Patient.findOne(query);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or access denied' });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create patient
exports.createPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If user is a parent, automatically link the patient to them
    if (req.user.role === 'Parent') {
      req.body.parentUser = req.user.id;
    }

    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete patient (soft delete)
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate verification code for parent linking (Healthcare staff only)
exports.generateParentCode = async (req, res) => {
  try {
    const { patientId, parentEmail, parentName } = req.body;

    // Only healthcare staff can generate codes
    if (!['Admin', 'Nurse', 'Doctor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only healthcare staff can generate verification codes' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (patient.parentUser) {
      return res.status(400).json({ message: 'Patient already linked to a parent account' });
    }

    // Generate a 6-digit verification code
    const code = crypto.randomInt(100000, 999999).toString();

    // Delete any existing unused codes for this patient
    await VerificationCode.deleteMany({ patientId, isUsed: false });

    // Create new verification code
    const verificationCode = await VerificationCode.create({
      patientId,
      code,
      generatedBy: req.user.id,
      parentEmail: parentEmail.toLowerCase(),
      parentName
    });

    res.status(201).json({
      success: true,
      message: 'Verification code generated successfully',
      data: {
        code,
        patientName: patient.name,
        parentName,
        parentEmail,
        expiresAt: verificationCode.expiresAt,
        patientId: patient._id
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get verification codes (Healthcare staff only)
exports.getVerificationCodes = async (req, res) => {
  try {
    if (!['Admin', 'Nurse', 'Doctor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const codes = await VerificationCode.find({ isUsed: false })
      .populate('patientId', 'name dateOfBirth')
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: codes.length, data: codes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};