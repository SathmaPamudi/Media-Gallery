const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Validation middleware
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Protected routes (authentication required)
router.use(verifyToken);

// User profile routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', validateProfileUpdate, userController.updateUserProfile);
router.get('/stats', userController.getUserStats);
router.get('/stats/:userId', userController.getUserStats);

// Admin routes
router.use('/admin', isAdmin);

// GET /api/users/admin - Get all users
router.get('/admin', userController.getAllUsers);

// GET /api/users/admin/stats - Get system statistics
router.get('/admin/stats', userController.getSystemStats);

// GET /api/users/admin/:id - Get specific user
router.get('/admin/:id', userController.getUserById);

// PUT /api/users/admin/:id - Update user
router.put('/admin/:id', validateUserUpdate, userController.updateUser);

// DELETE /api/users/admin/:id - Soft delete user
router.delete('/admin/:id', userController.deleteUser);

// PUT /api/users/admin/:id/restore - Restore user
router.put('/admin/:id/restore', userController.restoreUser);

module.exports = router; 