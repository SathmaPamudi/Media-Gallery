const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  file: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  category: {
    type: String,
    enum: ['nature', 'portrait', 'landscape', 'abstract', 'street', 'wildlife', 'architecture', 'other'],
    default: 'other'
  },
  metadata: {
    width: Number,
    height: Number,
    format: String,
    exif: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
mediaSchema.index({ user: 1, isActive: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ title: 'text', description: 'text' });
mediaSchema.index({ isPublic: 1, isActive: 1 });
mediaSchema.index({ category: 1 });
mediaSchema.index({ createdAt: -1 });

// Virtual for like count
mediaSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for full media info
mediaSchema.virtual('fullInfo').get(function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    tags: this.tags,
    file: this.file,
    user: this.user,
    isPublic: this.isPublic,
    views: this.views,
    downloads: this.downloads,
    likeCount: this.likeCount,
    category: this.category,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

// Ensure virtual fields are serialized
mediaSchema.set('toJSON', { virtuals: true });
mediaSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate file size
mediaSchema.pre('save', function(next) {
  if (this.file && this.file.size > 5 * 1024 * 1024) { // 5MB limit
    return next(new Error('File size cannot exceed 5MB'));
  }
  next();
});

// Static method to get media by user
mediaSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId, isActive: true };
  
  if (options.includePublic !== undefined) {
    query.isPublic = options.includePublic;
  }
  
  return this.find(query)
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 });
};

// Static method to search media
mediaSchema.statics.search = function(searchTerm, options = {}) {
  const query = { isActive: true };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  if (options.userId) {
    query.user = options.userId;
  }
  
  return this.find(query)
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 });
};

// Instance method to increment views
mediaSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment downloads
mediaSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// Instance method to toggle like
mediaSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  
  return this.save();
};

// Instance method to soft delete
mediaSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('Media', mediaSchema); 