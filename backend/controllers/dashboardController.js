const Patient = require('../models/Patient');
const Immunization = require('../models/Immunization');
const Vaccine = require('../models/Vaccine');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ isActive: true });
    const totalImmunizations = await Immunization.countDocuments();
    
    const today = new Date();
    const upcomingImmunizations = await Immunization.countDocuments({
      nextDueDate: { $gte: today, $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
      status: 'Due'
    });

    const overdueImmunizations = await Immunization.countDocuments({
      nextDueDate: { $lt: today },
      status: 'Overdue'
    });

    const lowStockVaccines = await Vaccine.countDocuments({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    });

    const recentImmunizations = await Immunization.find()
      .populate('patient', 'name')
      .populate('administeredBy', 'name')
      .sort({ dateAdministered: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalImmunizations,
        upcomingImmunizations,
        overdueImmunizations,
        lowStockVaccines,
        recentImmunizations
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get immunization coverage report
exports.getImmunizationCoverage = async (req, res) => {
  try {
    const coverage = await Immunization.aggregate([
      {
        $group: {
          _id: '$vaccineName',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({ success: true, data: coverage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
