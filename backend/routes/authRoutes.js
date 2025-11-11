const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const ensureDbConnection = require('../middleware/dbCheck');

const router = express.Router();

// Apply database check middleware to all routes
router.use(ensureDbConnection);

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'),
  body('role').isIn(['Admin', 'Nurse', 'Doctor', 'Parent']).withMessage('Invalid role')
], register);

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required')
], updateProfile);

module.exports = router;
