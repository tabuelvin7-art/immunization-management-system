const express = require('express');
const {
  getAllAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Doctor', 'Nurse', 'Admin'));

router.get('/', getAllAppointments);
router.put('/:id/status', updateAppointmentStatus);

module.exports = router;
