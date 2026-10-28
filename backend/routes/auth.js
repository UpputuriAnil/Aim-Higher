const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  registerStudent,
  registerTeacher,
  loginStudent,
  loginTeacher,
  googleAuth,
  getMe,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Public routes
// Student registration
router.post('/student/register', registerValidation, registerStudent);

// Teacher registration
router.post('/teacher/register', registerValidation, registerTeacher);

// Student login
router.post('/student/login', loginValidation, loginStudent);

// Teacher login
router.post('/teacher/login', loginValidation, loginTeacher);

// Google authentication (Firebase)
router.post('/google', googleAuth);

// Protected routes
router.use(protect);

// Get current user
router.get('/me', getMe);

// Update profile
router.put('/profile', updateProfileValidation, updateProfile);

// Change password
router.put('/change-password', changePasswordValidation, changePassword);

// Logout
router.post('/logout', logout);

module.exports = router;
