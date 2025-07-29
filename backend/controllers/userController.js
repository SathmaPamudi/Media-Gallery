const User = require('../models/User');
const Media = require('../models/Media');

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      role, 
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Add filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.'
    });
  }
};

// Admin: Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user.'
    });
  }
};

// Admin: Update user
const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user.'
    });
  }
};

// Admin: Soft delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    await user.softDelete();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user.'
    });
  }
};

// Admin: Restore user
const restoreUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    await user.restore();

    res.status(200).json({
      success: true,
      message: 'User restored successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore user.'
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.'
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken.'
        });
      }
      user.email = email;
      user.isEmailVerified = false; // Require re-verification if email changes
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount
        }
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile.'
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    // Get user info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Get media statistics
    const mediaStats = await Media.aggregate([
      { $match: { user: user._id, isActive: true } },
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

    // Get recent activity
    const recentMedia = await Media.find({ user: user._id, isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title file.url createdAt');

    // Get category distribution
    const categoryStats = await Media.aggregate([
      { $match: { user: user._id, isActive: true } },
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
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount,
          createdAt: user.createdAt
        },
        stats: mediaStats[0] || {
          totalMedia: 0,
          totalViews: 0,
          totalDownloads: 0,
          totalLikes: 0,
          publicMedia: 0,
          privateMedia: 0
        },
        recentMedia,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics.'
    });
  }
};

// Admin: Get system statistics
const getSystemStats = async (req, res) => {
  try {
    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
        }
      }
    ]);

    // Media statistics
    const mediaStats = await Media.aggregate([
      { $match: { isActive: true } },
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

    // Recent registrations
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    // Recent uploads
    const recentUploads = await Media.find({ isActive: true })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title file.url user createdAt');

    res.status(200).json({
      success: true,
      data: {
        userStats: userStats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          verifiedUsers: 0,
          adminUsers: 0
        },
        mediaStats: mediaStats[0] || {
          totalMedia: 0,
          totalViews: 0,
          totalDownloads: 0,
          totalLikes: 0,
          publicMedia: 0,
          privateMedia: 0
        },
        recentUsers,
        recentUploads
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics.'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  restoreUser,
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getSystemStats
}; 