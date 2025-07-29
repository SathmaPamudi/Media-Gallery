const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional - for guest users
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters'],
    default: 'General Inquiry'
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'replied', 'resolved'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  repliedAt: Date,
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contactSchema.index({ userId: 1, isActive: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });

// Virtual for full contact info
contactSchema.virtual('fullInfo').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    message: this.message,
    subject: this.subject,
    status: this.status,
    priority: this.priority,
    userId: this.userId,
    adminNotes: this.adminNotes,
    repliedAt: this.repliedAt,
    repliedBy: this.repliedBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

// Ensure virtual fields are serialized
contactSchema.set('toJSON', { virtuals: true });
contactSchema.set('toObject', { virtuals: true });

// Static method to get messages by user
contactSchema.statics.findByUser = function(userId) {
  return this.find({ userId, isActive: true })
    .populate('userId', 'name email')
    .populate('repliedBy', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get all messages for admin
contactSchema.statics.findAllForAdmin = function(options = {}) {
  const query = { isActive: true };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  if (options.search) {
    query.$or = [
      { name: { $regex: options.search, $options: 'i' } },
      { email: { $regex: options.search, $options: 'i' } },
      { message: { $regex: options.search, $options: 'i' } },
      { subject: { $regex: options.search, $options: 'i' } }
    ];
  }
  
  return this.find(query)
    .populate('userId', 'name email role')
    .populate('repliedBy', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get message statistics
contactSchema.statics.getStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        read: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        },
        replied: {
          $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] }
        },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        urgent: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Instance method to mark as read
contactSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

// Instance method to mark as replied
contactSchema.methods.markAsReplied = function(adminUserId) {
  this.status = 'replied';
  this.repliedAt = new Date();
  this.repliedBy = adminUserId;
  return this.save();
};

// Instance method to mark as resolved
contactSchema.methods.markAsResolved = function() {
  this.status = 'resolved';
  return this.save();
};

// Instance method to update priority
contactSchema.methods.updatePriority = function(priority) {
  this.priority = priority;
  return this.save();
};

// Instance method to add admin notes
contactSchema.methods.addAdminNotes = function(notes) {
  this.adminNotes = notes;
  return this.save();
};

// Instance method to soft delete
contactSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

// Pre-save middleware to validate message length
contactSchema.pre('save', function(next) {
  if (this.message && this.message.length > 1000) {
    return next(new Error('Message cannot exceed 1000 characters'));
  }
  next();
});

module.exports = mongoose.model('Contact', contactSchema); 