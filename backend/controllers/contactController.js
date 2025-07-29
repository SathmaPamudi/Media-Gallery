const Contact = require('../models/Contact');

// Submit contact message
const submitContact = async (req, res) => {
  try {
    const { name, email, message, subject } = req.body;

    // Create contact message
    const contact = new Contact({
      name,
      email,
      message,
      subject: subject || 'General Inquiry',
      userId: req.user ? req.user._id : null // Optional user association
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Message submitted successfully. We will get back to you soon!',
      data: {
        contact: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
          status: contact.status,
          createdAt: contact.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit message. Please try again.'
    });
  }
};

// Get user's messages
const getUserMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user._id;

    const query = { userId, isActive: true };
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const messages = await Contact.find(query)
      .populate('repliedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages.'
    });
  }
};

// Get message by ID
const getMessageById = async (req, res) => {
  try {
    const contact = req.contact; // From canAccessContact middleware

    res.status(200).json({
      success: true,
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Get message by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message.'
    });
  }
};

// Update message (user can only update their own messages)
const updateMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const contact = req.contact; // From canAccessContact middleware

    // Only allow updating message content
    if (message) {
      contact.message = message;
    }

    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Message updated successfully.',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message.'
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const contact = req.contact; // From canAccessContact middleware

    await contact.softDelete();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully.'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message.'
    });
  }
};

// Admin: Get all messages
const getAllMessages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };

    // Add filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const messages = await Contact.find(query)
      .populate('userId', 'name email role')
      .populate('repliedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages.'
    });
  }
};

// Admin: Get message statistics
const getMessageStats = async (req, res) => {
  try {
    const stats = await Contact.getStats();

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          total: 0,
          pending: 0,
          read: 0,
          replied: 0,
          resolved: 0,
          urgent: 0
        }
      }
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics.'
    });
  }
};

// Admin: Mark message as read
const markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.'
      });
    }

    await contact.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Message marked as read.',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read.'
    });
  }
};

// Admin: Mark message as replied
const markAsReplied = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.'
      });
    }

    await contact.markAsReplied(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Message marked as replied.',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Mark as replied error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as replied.'
    });
  }
};

// Admin: Mark message as resolved
const markAsResolved = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.'
      });
    }

    await contact.markAsResolved();

    res.status(200).json({
      success: true,
      message: 'Message marked as resolved.',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Mark as resolved error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as resolved.'
    });
  }
};

// Admin: Update message priority
const updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.'
      });
    }

    await contact.updatePriority(priority);

    res.status(200).json({
      success: true,
      message: 'Message priority updated.',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Update priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message priority.'
    });
  }
};

// Admin: Add admin notes
const addAdminNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.'
      });
    }

    await contact.addAdminNotes(notes);

    res.status(200).json({
      success: true,
      message: 'Admin notes added.',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Add admin notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add admin notes.'
    });
  }
};

// Admin: Delete any message
const deleteAnyMessage = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.'
      });
    }

    await contact.softDelete();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully.'
    });
  } catch (error) {
    console.error('Delete any message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message.'
    });
  }
};

module.exports = {
  submitContact,
  getUserMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getAllMessages,
  getMessageStats,
  markAsRead,
  markAsReplied,
  markAsResolved,
  updatePriority,
  addAdminNotes,
  deleteAnyMessage
}; 