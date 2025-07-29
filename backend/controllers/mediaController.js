const Media = require('../models/Media');
const { uploadImageBuffer, deleteImage, getImageInfo } = require('../utils/cloudinary');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

// Upload media
const uploadMedia = async (req, res) => {
  try {
    const { title, description, tags, category, isPublic } = req.body;
    const files = req.processedFiles;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded.'
      });
    }

    const uploadedMedia = [];

    for (const file of files) {
      try {
        // Upload to Cloudinary
        const uploadResult = await uploadImageBuffer(
          file.buffer,
          file.filename,
          { folder: `media-gallery/${req.user._id}` }
        );

        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }

        // Create media document
        const media = new Media({
          title: title || file.originalname,
          description: description || '',
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          category: category || 'other',
          isPublic: isPublic !== 'false',
          user: req.user._id,
          file: {
            public_id: uploadResult.public_id,
            url: uploadResult.url,
            filename: file.originalname,
            size: file.size,
            mimetype: file.mimetype
          },
          metadata: {
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format
          }
        });

        await media.save();
        await media.populate('user', 'name email avatar');

        uploadedMedia.push(media);
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        // Continue with other files even if one fails
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedMedia.length} file(s).`,
      data: {
        media: uploadedMedia
      }
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media. Please try again.'
    });
  }
};

// Get all media (with filters)
const getAllMedia = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      tags,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };

    // Add search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Add user filter
    if (userId) {
      query.user = userId;
    }

    // Handle public/private visibility
    if (req.user) {
      // Logged in user can see their own private media and all public media
      query.$or = [
        { isPublic: true },
        { user: req.user._id }
      ];
    } else {
      // Guest users can only see public media
      query.isPublic = true;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const media = await Media.find(query)
      .populate('user', 'name email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media.'
    });
  }
};

// Get media by ID
const getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('likes', 'name email avatar');

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found.'
      });
    }

    // Check if user can access this media
    if (!media.isPublic && (!req.user || media.user._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This media is private.'
      });
    }

    // Increment views
    await media.incrementViews();

    res.status(200).json({
      success: true,
      data: {
        media
      }
    });
  } catch (error) {
    console.error('Get media by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media.'
    });
  }
};

// Update media
const updateMedia = async (req, res) => {
  try {
    const { title, description, tags, category, isPublic } = req.body;
    const media = req.resource; // From isOwner middleware

    // Update fields
    if (title !== undefined) media.title = title;
    if (description !== undefined) media.description = description;
    if (tags !== undefined) media.tags = tags.split(',').map(tag => tag.trim());
    if (category !== undefined) media.category = category;
    if (isPublic !== undefined) media.isPublic = isPublic;

    await media.save();
    await media.populate('user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Media updated successfully.',
      data: {
        media
      }
    });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update media.'
    });
  }
};

// Delete media
const deleteMedia = async (req, res) => {
  try {
    const media = req.resource; // From isOwner middleware

    // Delete from Cloudinary
    if (media.file.public_id) {
      await deleteImage(media.file.public_id);
    }

    // Soft delete from database
    await media.softDelete();

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully.'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media.'
    });
  }
};

// Toggle like
const toggleLike = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found.'
      });
    }

    await media.toggleLike(req.user._id);
    await media.populate('likes', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Like toggled successfully.',
      data: {
        media
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like.'
    });
  }
};

// Download media as ZIP
const downloadZip = async (req, res) => {
  try {
    const { mediaIds } = req.body;

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one media item.'
      });
    }

    // Get media items
    const mediaItems = await Media.find({
      _id: { $in: mediaIds },
      isActive: true,
      $or: [
        { isPublic: true },
        { user: req.user._id }
      ]
    }).populate('user', 'name');

    if (mediaItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No media items found.'
      });
    }

    // Create ZIP file
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Set response headers
    res.attachment(`media-gallery-${Date.now()}.zip`);
    archive.pipe(res);

    // Add files to ZIP
    for (const media of mediaItems) {
      try {
        // Fetch image from Cloudinary
        const response = await fetch(media.file.url);
        const buffer = await response.buffer();

        // Add to ZIP with organized filename
        const filename = `${media.user.name}/${media.title || 'untitled'}.${media.metadata.format || 'jpg'}`;
        archive.append(buffer, { name: filename });
      } catch (error) {
        console.error(`Error adding ${media.title} to ZIP:`, error);
        // Continue with other files
      }
    }

    // Increment download count
    for (const media of mediaItems) {
      await media.incrementDownloads();
    }

    // Finalize ZIP
    await archive.finalize();

  } catch (error) {
    console.error('Download ZIP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ZIP file.'
    });
  }
};

// Get user's media
const getUserMedia = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { page = 1, limit = 12, includePublic = true } = req.query;

    const query = { user: userId, isActive: true };
    
    if (includePublic !== undefined) {
      query.isPublic = includePublic === 'true';
    }

    const skip = (page - 1) * limit;

    const media = await Media.find(query)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user media.'
    });
  }
};

// Search media
const searchMedia = async (req, res) => {
  try {
    const { q, category, tags, page = 1, limit = 12 } = req.query;

    if (!q && !category && !tags) {
      return res.status(400).json({
        success: false,
        message: 'Please provide search terms, category, or tags.'
      });
    }

    const searchOptions = {};
    
    if (q) {
      searchOptions.searchTerm = q;
    }
    if (category) {
      searchOptions.category = category;
    }
    if (tags) {
      searchOptions.tags = tags.split(',').map(tag => tag.trim());
    }

    const media = await Media.search(q, searchOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Media.countDocuments({
      $text: q ? { $search: q } : undefined,
      category: category || undefined,
      tags: tags ? { $in: tags.split(',').map(tag => tag.trim()) } : undefined,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search media.'
    });
  }
};

// Get media statistics
const getMediaStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Media.aggregate([
      { $match: { user: userId, isActive: true } },
      {
        $group: {
          _id: null,
          totalMedia: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalDownloads: { $sum: '$downloads' },
          totalLikes: { $sum: { $size: '$likes' } },
          publicMedia: { $sum: { $cond: ['$isPublic', 1, 0] } },
          privateMedia: { $sum: { $cond: ['$isPublic', 0, 1] } }
        }
      }
    ]);

    const categoryStats = await Media.aggregate([
      { $match: { user: userId, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          totalMedia: 0,
          totalViews: 0,
          totalDownloads: 0,
          totalLikes: 0,
          publicMedia: 0,
          privateMedia: 0
        },
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get media stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media statistics.'
    });
  }
};

module.exports = {
  uploadMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  toggleLike,
  downloadZip,
  getUserMedia,
  searchMedia,
  getMediaStats
}; 