const express = require('express');
const {
  getDashboardStats,
  getImmunizationCoverage
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/coverage', getImmunizationCoverage);

module.exports = router;
