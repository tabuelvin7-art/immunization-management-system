const express = require('express');
const { body } = require('express-validator');
const {
  getVaccines,
  getVaccine,
  createVaccine,
  updateVaccine,
  deleteVaccine,
  getLowStockVaccines
} = require('../controllers/vaccineController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/low-stock', getLowStockVaccines);

router.route('/')
  .get(getVaccines)
  .post(authorize('Admin', 'Nurse'), [
    body('name').notEmpty().withMessage('Vaccine name is required'),
    body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Valid quantity is required'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
    body('batchNumber').notEmpty().withMessage('Batch number is required')
  ], createVaccine);

router.route('/:id')
  .get(getVaccine)
  .put(authorize('Admin', 'Nurse'), updateVaccine)
  .delete(authorize('Admin'), deleteVaccine);

module.exports = router;
