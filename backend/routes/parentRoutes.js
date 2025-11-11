const express = require('express');
const {
  getMyChildren,
  getChildDetails,
  getChildImmunizations,
  getChildUpcomingImmunizations,
  getParentDashboard,
  linkChild
} = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Parent'));

router.get('/dashboard', getParentDashboard);
router.get('/children', getMyChildren);
router.post('/link-child', linkChild);
router.get('/children/:childId/immunizations', getChildImmunizations);
router.get('/children/:childId/upcoming', getChildUpcomingImmunizations);
router.get('/children/:childId', getChildDetails);

// Debug endpoint to check verification codes (development only)
router.get('/debug/codes/:patientId', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }
  
  try {
    const VerificationCode = require('../models/VerificationCode');
    const codes = await VerificationCode.find({ patientId: req.params.patientId });
    res.json({ codes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;