import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaHome, 
  FaImages, 
  FaUpload, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaCog,
  FaEnvelope,
  FaUsers
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-medium fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FaImages className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-gray-900">Media Gallery</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <FaHome className="text-sm" />
              <span>Home</span>
            </Link>

            <Link
              to="/gallery"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/gallery') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <FaImages className="text-sm" />
              <span>Gallery</span>
            </Link>

            {user && (
              <>
                <Link
                  to="/upload"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/upload') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <FaUpload className="text-sm" />
                  <span>Upload</span>
                </Link>

                {isAdmin() && (
                  <div className="relative group">
                    <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors">
                      <FaCog className="text-sm" />
                      <span>Admin</span>
                    </button>
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-strong border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      >
                        <FaCog className="text-sm" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/users"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      >
                        <FaUsers className="text-sm" />
                        <span>Users</span>
                      </Link>
                      <Link
                        to="/admin/messages"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      >
                        <FaEnvelope className="text-sm" />
                        <span>Messages</span>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}

            <Link
              to="/contact"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/contact') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <FaEnvelope className="text-sm" />
              <span>Contact</span>
            </Link>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={user.avatar?.url || 'https://via.placeholder.com/32'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-strong border border-gray-200">
                    <Link
                      to="/dashboard"
                      onClick={closeMenus}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    >
                      <FaUser className="text-sm" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    >
                      <FaUser className="text-sm" />
                      <span>Profile</span>
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-error-600 w-full text-left"
                    >
                      <FaSignOutAlt className="text-sm" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="btn btn-secondary btn-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              {isMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={closeMenus}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <FaHome className="text-sm" />
                <span>Home</span>
              </Link>

              <Link
                to="/gallery"
                onClick={closeMenus}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/gallery') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <FaImages className="text-sm" />
                <span>Gallery</span>
              </Link>

              {user && (
                <>
                  <Link
                    to="/upload"
                    onClick={closeMenus}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/upload') 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaUpload className="text-sm" />
                    <span>Upload</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={closeMenus}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/dashboard') 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaUser className="text-sm" />
                    <span>Dashboard</span>
                  </Link>

                  {isAdmin() && (
                    <>
                      <Link
                        to="/admin"
                        onClick={closeMenus}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                          isActive('/admin') 
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <FaCog className="text-sm" />
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/users"
                        onClick={closeMenus}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                          isActive('/admin/users') 
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <FaUsers className="text-sm" />
                        <span>Users</span>
                      </Link>
                      <Link
                        to="/admin/messages"
                        onClick={closeMenus}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                          isActive('/admin/messages') 
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <FaEnvelope className="text-sm" />
                        <span>Messages</span>
                      </Link>
                    </>
                  )}
                </>
              )}

              <Link
                to="/contact"
                onClick={closeMenus}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/contact') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <FaEnvelope className="text-sm" />
                <span>Contact</span>
              </Link>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-error-600 hover:bg-gray-50 w-full text-left"
                >
                  <FaSignOutAlt className="text-sm" />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 pt-2">
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="btn btn-secondary btn-sm flex-1 justify-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenus}
                    className="btn btn-primary btn-sm flex-1 justify-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 