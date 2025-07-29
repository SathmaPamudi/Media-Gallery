const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
const uploadImage = async (file, options = {}) => {
  try {
    const uploadOptions = {
      folder: 'media-gallery',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    
    return {
      success: true,
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      created_at: result.created_at
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload image from buffer
const uploadImageBuffer = async (buffer, filename, options = {}) => {
  try {
    const uploadOptions = {
      folder: 'media-gallery',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      public_id: filename.replace(/\.[^/.]+$/, ''), // Remove file extension
      ...options
    };

    const result = await cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error('Cloudinary upload stream error:', error);
        return { success: false, error: error.message };
      }
      return result;
    }).end(buffer);

    return {
      success: true,
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      created_at: result.created_at
    };
  } catch (error) {
    console.error('Cloudinary buffer upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image'
    });
    
    return {
      success: true,
      result: result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get image info
const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'image'
    });
    
    return {
      success: true,
      info: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        created_at: result.created_at,
        tags: result.tags || []
      }
    };
  } catch (error) {
    console.error('Cloudinary get info error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate optimized URL
const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto:good',
    fetch_format: 'auto',
    width: 'auto',
    height: 'auto'
  };

  const transformationOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, {
    resource_type: 'image',
    transformation: [transformationOptions]
  });
};

// Generate thumbnail URL
const getThumbnailUrl = (publicId, width = 300, height = 300) => {
  return cloudinary.url(publicId, {
    resource_type: 'image',
    transformation: [
      { width, height, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good' }
    ]
  });
};

// Generate responsive URLs
const getResponsiveUrls = (publicId) => {
  const sizes = [300, 600, 900, 1200];
  
  return sizes.map(size => ({
    size,
    url: cloudinary.url(publicId, {
      resource_type: 'image',
      transformation: [
        { width: size, height: size, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    })
  }));
};

// Validate file type
const validateFileType = (mimetype) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(mimetype);
};

// Validate file size (5MB limit)
const validateFileSize = (size) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return size <= maxSize;
};

module.exports = {
  uploadImage,
  uploadImageBuffer,
  deleteImage,
  getImageInfo,
  getOptimizedUrl,
  getThumbnailUrl,
  getResponsiveUrls,
  validateFileType,
  validateFileSize
}; 