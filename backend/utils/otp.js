const crypto = require('crypto');

// Generate OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash token for storage
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Verify token
const verifyToken = (token, hashedToken) => {
  const hashedInput = hashToken(token);
  return hashedInput === hashedToken;
};

// Set expiration time (default 10 minutes)
const setExpirationTime = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

// Check if token is expired
const isTokenExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

module.exports = {
  generateOTP,
  generateVerificationToken,
  generateResetToken,
  hashToken,
  verifyToken,
  setExpirationTime,
  isTokenExpired
}; 