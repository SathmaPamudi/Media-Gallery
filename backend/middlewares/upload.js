const multer = require('multer');
const path = require('path');
const { validateFileType, validateFileSize } = require('../utils/cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!validateFileType(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP files are allowed.'), false);
  }

  // Check file size (5MB limit)
  if (!validateFileSize(file.size)) {
    return cb(new Error('File size too large. Maximum size is 5MB.'), false);
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Maximum 10 files at once
  }
});

// Single file upload middleware
const uploadSingle = upload.single('image');

// Multiple files upload middleware
const uploadMultiple = upload.array('images', 10);

// Error handling wrapper
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 5MB.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 10 files allowed.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected file field.'
          });
        }
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Validate uploaded files
const validateUploadedFiles = (req, res, next) => {
  if (!req.files && !req.file) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded.'
    });
  }

  const files = req.files || [req.file];
  
  for (const file of files) {
    if (!file) continue;
    
    // Validate file type
    if (!validateFileType(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type for ${file.originalname}. Only JPG, PNG, GIF, and WebP files are allowed.`
      });
    }

    // Validate file size
    if (!validateFileSize(file.size)) {
      return res.status(400).json({
        success: false,
        message: `File ${file.originalname} is too large. Maximum size is 5MB.`
      });
    }
  }

  next();
};

// Process uploaded files
const processUploadedFiles = async (req, res, next) => {
  try {
    const files = req.files || [req.file];
    const processedFiles = [];

    for (const file of files) {
      if (!file) continue;

      const fileInfo = {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
        filename: `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
      };

      processedFiles.push(fileInfo);
    }

    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    console.error('File processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing uploaded files.'
    });
  }
};

// Clean up uploaded files (for local storage)
const cleanupFiles = (req, res, next) => {
  // This would be used if storing files locally
  // For Cloudinary, we don't need to clean up
  next();
};

// Generate unique filename
const generateUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const ext = path.extname(originalname);
  const name = path.basename(originalname, ext);
  
  return `${name}-${timestamp}-${random}${ext}`;
};

// Validate image dimensions (optional)
const validateImageDimensions = (width, height, maxWidth = 4000, maxHeight = 4000) => {
  return width <= maxWidth && height <= maxHeight;
};

module.exports = {
  uploadSingle: handleUpload(uploadSingle),
  uploadMultiple: handleUpload(uploadMultiple),
  validateUploadedFiles,
  processUploadedFiles,
  cleanupFiles,
  generateUniqueFilename,
  validateImageDimensions
}; 