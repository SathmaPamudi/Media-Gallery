const User = require('../models/User');
const { generateOTP, generateVerificationToken, generateResetToken, hashToken, verifyToken, setExpirationTime, isTokenExpired } = require('../utils/otp');
const { sendEmailVerification, sendPasswordReset, sendWelcomeEmail } = require('../utils/email');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    // Generate OTP and verification token
    const otp = generateOTP();
    const verificationToken = generateVerificationToken();
    const hashedToken = hashToken(verificationToken);

    // Create user
    const user = new User({
      name,
      email,
      password,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: setExpirationTime(10) // 10 minutes
    });

    await user.save();

    // Send verification email
    const emailResult = await sendEmailVerification(email, name, otp);
    
    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      // Still create user but mark as unverified
    }

    // Store OTP in session or temporary storage (in production, use Redis)
    // For now, we'll store it in the user document temporarily
    user.otp = otp;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      data: {
        userId: user._id,
        email: user.email,
        verificationToken: verificationToken // Send token to frontend for verification
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// Verify email with OTP
const verifyEmail = async (req, res) => {
  try {
    const { email, otp, verificationToken } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Verify token
    if (!verifyToken(verificationToken, user.emailVerificationToken)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token.'
      });
    }

    // Check if token is expired
    if (isTokenExpired(user.emailVerificationExpires)) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired.'
      });
    }

    // Verify OTP (in production, use Redis for OTP storage)
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.otp = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed. Please try again.'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address first.'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Update login stats
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// Google OAuth login
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user with Google info
      user.googleId = googleId;
      user.isEmailVerified = true;
      user.avatar = { url: picture };
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        avatar: { url: picture },
        isEmailVerified: true,
        password: Math.random().toString(36).slice(-10) // Random password for Google users
      });
      await user.save();
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Google login successful!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google login failed. Please try again.'
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Generate reset token and OTP
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);
    const otp = generateOTP();

    // Save reset token
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = setExpirationTime(10); // 10 minutes
    user.otp = otp; // Store OTP temporarily
    await user.save();

    // Send reset email
    const emailResult = await sendPasswordReset(email, user.name, otp);
    
    if (!emailResult.success) {
      console.error('Password reset email failed:', emailResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent. Please check your email.',
      data: {
        resetToken: resetToken // Send token to frontend
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed. Please try again.'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, resetToken, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Verify reset token
    if (!verifyToken(resetToken, user.resetPasswordToken)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token.'
      });
    }

    // Check if token is expired
    if (isTokenExpired(user.resetPasswordExpires)) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired.'
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.'
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.otp = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed. Please try again.'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
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
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information.'
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return a success message
    res.status(200).json({
      success: true,
      message: 'Logout successful!'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed.'
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  logout
}; 