import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  // Login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register
  register: (userData) => api.post('/auth/register', userData),
  
  // Google login
  googleLogin: (idToken) => api.post('/auth/google', { idToken }),
  
  // Verify email
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
  
  // Logout
  logout: () => api.post('/auth/logout'),
};

export const mediaAPI = {
  // Get all media
  getAllMedia: (params) => api.get('/media', { params }),
  
  // Get media by ID
  getMediaById: (id) => api.get(`/media/${id}`),
  
  // Upload media
  uploadMedia: (formData, config) => api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  }),
  
  // Update media
  updateMedia: (id, data) => api.put(`/media/${id}`, data),
  
  // Delete media
  deleteMedia: (id) => api.delete(`/media/${id}`),
  
  // Toggle like
  toggleLike: (id) => api.post(`/media/${id}/like`),
  
  // Download ZIP
  downloadZip: (mediaIds) => api.post('/media/download-zip', { mediaIds }, {
    responseType: 'blob',
  }),
  
  // Get user media
  getUserMedia: (userId, params) => api.get(`/media/user/${userId || 'me'}`, { params }),
  
  // Search media
  searchMedia: (params) => api.get('/media/search', { params }),
  
  // Get media stats
  getMediaStats: () => api.get('/media/stats/me'),
};

export const contactAPI = {
  // Submit contact message
  submitContact: (data) => api.post('/contact', data),
  
  // Get user messages
  getUserMessages: (params) => api.get('/contact/my-messages', { params }),
  
  // Get message by ID
  getMessageById: (id) => api.get(`/contact/my-messages/${id}`),
  
  // Update message
  updateMessage: (id, data) => api.put(`/contact/my-messages/${id}`, data),
  
  // Delete message
  deleteMessage: (id) => api.delete(`/contact/my-messages/${id}`),
  
  // Admin: Get all messages
  getAllMessages: (params) => api.get('/contact/admin', { params }),
  
  // Admin: Get message stats
  getMessageStats: () => api.get('/contact/admin/stats'),
  
  // Admin: Reply to message
  replyToMessage: (id, data) => api.post(`/contact/admin/${id}/reply`, data),
  
  // Admin: Update message status
  updateMessageStatus: (id, status) => api.put(`/contact/admin/${id}/status`, { status }),
  
  // Admin: Mark as read
  markAsRead: (id) => api.put(`/contact/admin/${id}/read`),
  
  // Admin: Mark as replied
  markAsReplied: (id) => api.put(`/contact/admin/${id}/replied`),
  
  // Admin: Mark as resolved
  markAsResolved: (id) => api.put(`/contact/admin/${id}/resolved`),
  
  // Admin: Update priority
  updatePriority: (id, priority) => api.put(`/contact/admin/${id}/priority`, { priority }),
  
  // Admin: Add notes
  addNotes: (id, notes) => api.put(`/contact/admin/${id}/notes`, { notes }),
  
  // Admin: Delete message
  deleteAnyMessage: (id) => api.delete(`/contact/admin/${id}`),
};

export const userAPI = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),
  
  // Update profile
  updateProfile: (data) => api.put('/users/profile', data),
  
  // Get user stats
  getUserStats: (userId) => api.get(`/users/stats/${userId || ''}`),
  
  // Admin: Get all users
  getAllUsers: (params) => api.get('/users/admin', { params }),
  
  // Admin: Get system stats
  getSystemStats: () => api.get('/users/admin/stats'),
  
  // Admin: Get user by ID
  getUserById: (id) => api.get(`/users/admin/${id}`),
  
  // Admin: Update user
  updateUser: (id, data) => api.put(`/users/admin/${id}`, data),
  
  // Admin: Delete user
  deleteUser: (id) => api.delete(`/users/admin/${id}`),
  
  // Admin: Restore user
  restoreUser: (id) => api.put(`/users/admin/${id}/restore`),
};

// Utility functions
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export default api; 