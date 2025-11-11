const express = require('express');
const {
  createAppointment,
  getMyAppointments,
  cancelAppointment
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Parent'));

router.post('/', createAppointment);
router.get('/', getMyAppointments);
router.put('/:id/cancel', cancelAppointment);

module.exports = router;
