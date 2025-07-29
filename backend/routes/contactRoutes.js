const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { verifyToken, isAdmin, canAccessContact } = require('../middlewares/auth');

// Validation middleware
const validateContactSubmission = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Subject cannot exceed 100 characters')
];

const validateMessageUpdate = [
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

const validateAdminNotes = [
  body('notes')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notes cannot exceed 500 characters')
];

const validatePriorityUpdate = [
  body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level')
];

// Public routes (no authentication required)
router.post('/', validateContactSubmission, contactController.submitContact);

// Protected routes (authentication required)
router.use(verifyToken);

// User message routes
router.get('/my-messages', contactController.getUserMessages);
router.get('/my-messages/:id', canAccessContact, contactController.getMessageById);
router.put('/my-messages/:id', canAccessContact, validateMessageUpdate, contactController.updateMessage);
router.delete('/my-messages/:id', canAccessContact, contactController.deleteMessage);

// Admin routes
router.use('/admin', isAdmin);

// GET /api/contact/admin - Get all messages
router.get('/admin', contactController.getAllMessages);

// GET /api/contact/admin/stats - Get message statistics
router.get('/admin/stats', contactController.getMessageStats);

// GET /api/contact/admin/:id - Get specific message
router.get('/admin/:id', contactController.getMessageById);

// PUT /api/contact/admin/:id/read - Mark as read
router.put('/admin/:id/read', contactController.markAsRead);

// PUT /api/contact/admin/:id/replied - Mark as replied
router.put('/admin/:id/replied', contactController.markAsReplied);

// PUT /api/contact/admin/:id/resolved - Mark as resolved
router.put('/admin/:id/resolved', contactController.markAsResolved);

// PUT /api/contact/admin/:id/priority - Update priority
router.put('/admin/:id/priority', validatePriorityUpdate, contactController.updatePriority);

// PUT /api/contact/admin/:id/notes - Add admin notes
router.put('/admin/:id/notes', validateAdminNotes, contactController.addAdminNotes);

// DELETE /api/contact/admin/:id - Delete any message
router.delete('/admin/:id', contactController.deleteAnyMessage);

module.exports = router; 