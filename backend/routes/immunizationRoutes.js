const express = require('express');
const { body } = require('express-validator');
const {
  getImmunizations,
  getImmunization,
  createImmunization,
  updateImmunization,
  deleteImmunization,
  getOverdueImmunizations
} = require('../controllers/immunizationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/overdue', getOverdueImmunizations);

router.route('/')
  .get(getImmunizations)
  .post(authorize('Doctor', 'Nurse'), [
    body('patient').notEmpty().withMessage('Patient ID is required'),
    body('vaccineName').notEmpty().withMessage('Vaccine name is required'),
    body('dateAdministered').isISO8601().withMessage('Valid date is required'),
    body('batchNumber').notEmpty().withMessage('Batch number is required')
  ], createImmunization);

router.route('/:id')
  .get(getImmunization)
  .put(authorize('Doctor', 'Nurse'), updateImmunization)
  .delete(authorize('Doctor', 'Nurse', 'Admin'), deleteImmunization);

module.exports = router;
