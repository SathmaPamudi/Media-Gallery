import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaImages, 
  FaUpload, 
  FaSearch, 
  FaDownload, 
  FaShieldAlt, 
  FaUsers,
  FaArrowRight,
  FaPlay
} from 'react-icons/fa';

const HomePage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <FaUpload className="text-2xl" />,
      title: 'Easy Upload',
      description: 'Drag and drop your images with support for JPG, PNG, GIF, and WebP formats up to 5MB.'
    },
    {
      icon: <FaSearch className="text-2xl" />,
      title: 'Smart Search',
      description: 'Find your media quickly with advanced search and filtering by tags, categories, and titles.'
    },
    {
      icon: <FaDownload className="text-2xl" />,
      title: 'ZIP Download',
      description: 'Download multiple images as a ZIP file for easy sharing and backup.'
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: 'Secure Storage',
      description: 'Your media is stored securely with Cloudinary integration and user authentication.'
    },
    {
      icon: <FaUsers className="text-2xl" />,
      title: 'User Management',
      description: 'Create personal and shared galleries with role-based access control.'
    },
    {
      icon: <FaImages className="text-2xl" />,
      title: 'Gallery Management',
      description: 'Organize your media with categories, tags, and customizable metadata.'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Manage Your
            <span className="text-primary-600"> Media Gallery</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive media gallery management system built with the MERN stack. 
            Upload, organize, and share your media files with secure authentication and advanced features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link
                  to="/upload"
                  className="btn btn-primary btn-lg flex items-center justify-center space-x-2"
                >
                  <FaUpload />
                  <span>Upload Media</span>
                </Link>
                <Link
                  to="/gallery"
                  className="btn btn-secondary btn-lg flex items-center justify-center space-x-2"
                >
                  <FaImages />
                  <span>View Gallery</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg flex items-center justify-center space-x-2"
                >
                  <span>Get Started</span>
                  <FaArrowRight />
                </Link>
                <Link
                  to="/gallery"
                  className="btn btn-secondary btn-lg flex items-center justify-center space-x-2"
                >
                  <FaImages />
                  <span>Browse Gallery</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your media collection effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:shadow-medium transition-shadow duration-300"
              >
                <div className="card-body text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust Media Gallery for their media management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg flex items-center justify-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <FaArrowRight />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg flex items-center justify-center space-x-2"
                >
                  <span>Create Account</span>
                  <FaArrowRight />
                </Link>
                <Link
                  to="/contact"
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 btn-lg flex items-center justify-center space-x-2"
                >
                  <FaPlay />
                  <span>Learn More</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600">Media Files</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">5K+</div>
              <div className="text-gray-600">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 