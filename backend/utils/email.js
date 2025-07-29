const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
};

// Email verification template
const emailVerificationTemplate = (name, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Media Gallery</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          Thank you for registering with Media Gallery. To complete your registration, 
          please use the following verification code:
        </p>
        
        <div style="background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${otp}</h3>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          This code will expire in 10 minutes. If you didn't request this verification, 
          please ignore this email.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 14px;">
            Best regards,<br>
            Media Gallery Team
          </p>
        </div>
      </div>
    </div>
  `;
};

// Password reset template
const passwordResetTemplate = (name, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Media Gallery</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          We received a request to reset your password. Use the following code to reset your password:
        </p>
        
        <div style="background: #fff; border: 2px dashed #ff6b6b; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #ff6b6b; font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${otp}</h3>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          This code will expire in 10 minutes. If you didn't request a password reset, 
          please ignore this email and your password will remain unchanged.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 14px;">
            Best regards,<br>
            Media Gallery Team
          </p>
        </div>
      </div>
    </div>
  `;
};

// Welcome email template
const welcomeEmailTemplate = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Media Gallery</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Welcome to Media Gallery, ${name}!</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Thank you for joining our community! Your account has been successfully verified and you can now:
        </p>
        
        <ul style="color: #666; line-height: 1.8; margin-bottom: 25px;">
          <li>Upload and manage your media files</li>
          <li>Create personal and shared galleries</li>
          <li>Search and filter through your media</li>
          <li>Download your images as ZIP files</li>
          <li>Connect with other users</li>
        </ul>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
             style="background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
            Start Exploring
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 14px;">
            Best regards,<br>
            Media Gallery Team
          </p>
        </div>
      </div>
    </div>
  `;
};

// Send email verification
const sendEmailVerification = async (email, name, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Email Verification - Media Gallery',
      html: emailVerificationTemplate(name, otp)
    };
    
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset
const sendPasswordReset = async (email, name, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Password Reset - Media Gallery',
      html: passwordResetTemplate(name, otp)
    };
    
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Password reset email error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Welcome to Media Gallery!',
      html: welcomeEmailTemplate(name)
    };
    
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmailVerification,
  sendPasswordReset,
  sendWelcomeEmail,
  emailVerificationTemplate,
  passwordResetTemplate,
  welcomeEmailTemplate
}; 