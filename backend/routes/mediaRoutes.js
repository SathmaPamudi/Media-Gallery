const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const mediaController = require('../controllers/mediaController');
const { verifyToken, isVerified, isOwner, optionalAuth } = require('../middlewares/auth');
const { uploadSingle, uploadMultiple, validateUploadedFiles, processUploadedFiles } = require('../middlewares/upload');
const Media = require('../models/Media');

// Validation middleware
const validateMediaUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string'),
  body('category')
    .optional()
    .isIn(['nature', 'portrait', 'landscape', 'abstract', 'street', 'wildlife', 'architecture', 'other'])
    .withMessage('Invalid category'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

const validateZipDownload = [
  body('mediaIds')
    .isArray({ min: 1 })
    .withMessage('Please select at least one media item'),
  body('mediaIds.*')
    .isMongoId()
    .withMessage('Invalid media ID')
];

// Public routes (no authentication required)
router.get('/', optionalAuth, mediaController.getAllMedia);
router.get('/search', optionalAuth, mediaController.searchMedia);
router.get('/:id', optionalAuth, mediaController.getMediaById);

// Protected routes (authentication required)
router.use(verifyToken, isVerified);

// Upload routes
router.post('/upload', uploadMultiple, validateUploadedFiles, processUploadedFiles, mediaController.uploadMedia);

// User media routes
router.get('/user/me', mediaController.getUserMedia);
router.get('/user/:userId', mediaController.getUserMedia);
router.get('/stats/me', mediaController.getMediaStats);

// CRUD operations (owner only)
router.put('/:id', isOwner(Media), validateMediaUpdate, mediaController.updateMedia);
router.delete('/:id', isOwner(Media), mediaController.deleteMedia);

// Like functionality
router.post('/:id/like', mediaController.toggleLike);

// ZIP download
router.post('/download-zip', validateZipDownload, mediaController.downloadZip);

module.exports = router; 