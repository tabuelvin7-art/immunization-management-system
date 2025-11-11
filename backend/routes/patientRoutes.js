const express = require('express');
const { body } = require('express-validator');
const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  generateParentCode,
  getVerificationCodes
} = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Verification code routes (Healthcare staff only)
router.get('/verification-codes', getVerificationCodes);
router.post('/generate-parent-code', [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('parentEmail').isEmail().withMessage('Valid parent email is required'),
  body('parentName').notEmpty().withMessage('Parent name is required')
], generateParentCode);

router.route('/')
  .get(getPatients)
  .post([
    body('name').notEmpty().withMessage('Name is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender')
  ], createPatient);

router.route('/:id')
  .get(getPatient)
  .put(updatePatient)
  .delete(deletePatient);

module.exports = router;
