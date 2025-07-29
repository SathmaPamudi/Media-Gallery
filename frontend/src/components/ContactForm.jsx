import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { contactAPI } from '../utils/api';
import { toast } from 'react-hot-toast';
import { FaPaperPlane, FaUser, FaEnvelope, FaFileAlt } from 'react-icons/fa';

const ContactForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    setLoading(true);
    
    try {
      await contactAPI.submitContact(formData);
      
      // Reset form
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
      });
      
      toast.success('Message sent successfully! We will get back to you soon.');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="card-header">
        <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
        <p className="text-gray-600 mt-2">
          Have a question or need help? Send us a message and we'll get back to you as soon as possible.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="card-body space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            <FaUser className="inline mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <FaEnvelope className="inline mr-2" />
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            placeholder="Enter your email address"
            required
          />
        </div>

        {/* Subject Field */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            <FaFileAlt className="inline mr-2" />
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="input"
            placeholder="Enter subject (optional)"
          />
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className="input resize-none"
            placeholder="Enter your message here..."
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.message.length}/1000 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="loading-spinner w-4 h-4"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FaPaperPlane className="text-sm" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Additional Information */}
      <div className="card-footer">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="text-center">
            <div className="font-semibold text-gray-900">Response Time</div>
            <div>Within 24 hours</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">Support Hours</div>
            <div>Mon-Fri, 9AM-6PM</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">Priority Support</div>
            <div>For registered users</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm; 