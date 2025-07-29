const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

// Validation middleware
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateEmailVerification = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
  body('verificationToken')
    .notEmpty()
    .withMessage('Verification token is required')
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const validateResetPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const validateGoogleLogin = [
  body('idToken')
    .notEmpty()
    .withMessage('Google ID token is required')
];

// Routes

// POST /api/auth/register
router.post('/register', validateRegistration, authController.register);

// POST /api/auth/verify-email
router.post('/verify-email', validateEmailVerification, authController.verifyEmail);

// POST /api/auth/login
router.post('/login', validateLogin, authController.login);

// POST /api/auth/google
router.post('/google', validateGoogleLogin, authController.googleLogin);

// POST /api/auth/forgot-password
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', validateResetPassword, authController.resetPassword);

// GET /api/auth/me
router.get('/me', verifyToken, authController.getCurrentUser);

// POST /api/auth/logout
router.post('/logout', verifyToken, authController.logout);

module.exports = router; 