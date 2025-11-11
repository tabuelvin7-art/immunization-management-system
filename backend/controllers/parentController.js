const Patient = require('../models/Patient');
const Immunization = require('../models/Immunization');
const Notification = require('../models/Notification');
const VerificationCode = require('../models/VerificationCode');

// Get parent's children
exports.getMyChildren = async (req, res) => {
  try {
    const children = await Patient.find({ 
      parentUser: req.user.id,
      isActive: true 
    }).sort({ name: 1 });

    res.status(200).json({ success: true, count: children.length, data: children });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific child details
exports.getChildDetails = async (req, res) => {
  try {
    const child = await Patient.findOne({
      _id: req.params.childId,
      parentUser: req.user.id,
      isActive: true
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found or access denied' });
    }

    res.status(200).json({ success: true, data: child });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get child's immunization history
exports.getChildImmunizations = async (req, res) => {
  try {
    // Verify the child belongs to the parent
    const child = await Patient.findOne({
      _id: req.params.childId,
      parentUser: req.user.id
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found or access denied' });
    }

    const immunizations = await Immunization.find({ patient: req.params.childId })
      .populate('administeredBy', 'name role')
      .sort({ dateAdministered: -1 });

    res.status(200).json({ success: true, count: immunizations.length, data: immunizations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get child's upcoming immunizations
exports.getChildUpcomingImmunizations = async (req, res) => {
  try {
    const child = await Patient.findOne({
      _id: req.params.childId,
      parentUser: req.user.id
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found or access denied' });
    }

    const today = new Date();
    const upcomingImmunizations = await Immunization.find({
      patient: req.params.childId,
      nextDueDate: { $gte: today },
      status: { $in: ['Due', 'Overdue'] }
    }).sort({ nextDueDate: 1 });

    res.status(200).json({ success: true, count: upcomingImmunizations.length, data: upcomingImmunizations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get parent dashboard stats
exports.getParentDashboard = async (req, res) => {
  try {
    const children = await Patient.find({ 
      parentUser: req.user.id,
      isActive: true 
    });

    const childIds = children.map(child => child._id);

    const totalChildren = children.length;
    
    const totalImmunizations = await Immunization.countDocuments({
      patient: { $in: childIds }
    });

    const today = new Date();
    const upcomingImmunizations = await Immunization.countDocuments({
      patient: { $in: childIds },
      nextDueDate: { $gte: today, $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
      status: 'Due'
    });

    const overdueImmunizations = await Immunization.countDocuments({
      patient: { $in: childIds },
      nextDueDate: { $lt: today },
      status: 'Overdue'
    });

    const unreadNotifications = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    const recentImmunizations = await Immunization.find({
      patient: { $in: childIds }
    })
      .populate('patient', 'name')
      .populate('administeredBy', 'name')
      .sort({ dateAdministered: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalChildren,
        totalImmunizations,
        upcomingImmunizations,
        overdueImmunizations,
        unreadNotifications,
        recentImmunizations,
        children
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Link child to parent account
exports.linkChild = async (req, res) => {
  try {
    const { childId, verificationCode } = req.body;

    console.log('Link child request:', { childId, verificationCode, userEmail: req.user.email });

    if (!childId || !verificationCode) {
      return res.status(400).json({ message: 'Patient ID and verification code are required' });
    }

    // First, let's check if the patient exists
    const patient = await Patient.findById(childId);
    if (!patient) {
      return res.status(400).json({ message: 'Patient not found with the provided ID' });
    }

    console.log('Patient found:', patient.name);

    // Find the verification code with more detailed logging
    const codeRecord = await VerificationCode.findOne({
      patientId: childId,
      code: verificationCode.toString(),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).populate('patientId');

    console.log('Code search result:', codeRecord ? 'Found' : 'Not found');
    
    if (!codeRecord) {
      // Let's check what codes exist for this patient
      const allCodes = await VerificationCode.find({ patientId: childId });
      console.log('All codes for patient:', allCodes.map(c => ({ 
        code: c.code, 
        isUsed: c.isUsed, 
        expired: c.expiresAt < new Date(),
        expiresAt: c.expiresAt 
      })));
      
      return res.status(400).json({ 
        message: 'Invalid or expired verification code. Please contact your healthcare provider for a new code.',
        debug: process.env.NODE_ENV === 'development' ? { 
          availableCodes: allCodes.length,
          searchCriteria: { patientId: childId, code: verificationCode, isUsed: false }
        } : undefined
      });
    }

    console.log('Code record found:', { 
      parentEmail: codeRecord.parentEmail, 
      userEmail: req.user.email,
      isUsed: codeRecord.isUsed,
      expiresAt: codeRecord.expiresAt 
    });

    // Verify parent email matches (case insensitive)
    if (codeRecord.parentEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(400).json({ 
        message: `This verification code was issued for ${codeRecord.parentEmail}. Please use the correct parent account or contact your healthcare provider.`,
        debug: process.env.NODE_ENV === 'development' ? {
          expectedEmail: codeRecord.parentEmail,
          providedEmail: req.user.email
        } : undefined
      });
    }

    const child = codeRecord.patientId;

    // Check if child is already linked to another parent
    if (child.parentUser) {
      return res.status(400).json({ message: 'This child is already linked to another parent account' });
    }

    // Link the child to the parent
    child.parentUser = req.user.id;
    await child.save();

    // Mark verification code as used
    codeRecord.isUsed = true;
    await codeRecord.save();

    console.log('Child successfully linked:', child.name);

    // Create a welcome notification
    try {
      const { createNotification } = require('./notificationController');
      await createNotification(
        req.user.id,
        'general',
        'Child Account Linked Successfully',
        `${child.name} has been successfully linked to your parent account. You can now view their immunization records and receive notifications.`,
        child._id,
        null,
        'medium'
      );
    } catch (notificationError) {
      console.log('Notification creation failed:', notificationError.message);
      // Don't fail the whole operation if notification fails
    }

    res.status(200).json({ 
      success: true, 
      message: `${child.name} has been successfully linked to your account`,
      data: child 
    });
  } catch (error) {
    console.error('Link child error:', error);
    res.status(500).json({ message: error.message });
  }
};