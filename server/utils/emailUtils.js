const nodemailer = require('nodemailer');

// Create a transport configuration based on environment variables
const createTransporter = () => {
  // Check if email credentials are properly configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
      process.env.EMAIL_USER === 'your-email@gmail.com' || 
      process.env.EMAIL_PASSWORD === 'your-app-password') {
    console.warn('WARNING: Email credentials not properly configured in .env file');
    return null;
  }

  // Configure the email transporter for Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Increase timeout to handle potential connection issues
    connectionTimeout: 10000,
    // Enable debugging if in development mode
    debug: process.env.NODE_ENV === 'development'
  });
};

// Function to send welcome email
const sendWelcomeEmail = async (recipientEmail, name) => {
  try {
    // Create the transporter
    const transporter = createTransporter();
    
    // If transporter couldn't be created, log error and exit
    if (!transporter) {
      console.error('Email transporter not configured. Check your .env file.');
      return false;
    }
    
    // Setup email content
    const mailOptions = {
      from: `"Exam Bridge" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Welcome to Exam Bridge!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4f46e5;">Welcome to Exam Bridge!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for signing up with Exam Bridge, your accessible exam platform.</p>
          <p>We're excited to have you onboard and are committed to providing you with the best experience.</p>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
            <p style="margin: 0; font-weight: bold;">Get Started:</p>
            <p style="margin: 10px 0 0 0;">Explore the platform and discover all the features available to enhance your exam experience.</p>
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">The Exam Bridge Team</p>
        </div>
      `,
      // Add plain text alternative for better email client compatibility
      text: `Welcome to Exam Bridge!\n\nHello ${name},\n\nThank you for signing up with Exam Bridge, your accessible exam platform. We're excited to have you onboard and are committed to providing you with the best experience.\n\nIf you have any questions or need assistance, please don't hesitate to contact our support team.\n\nGet Started: Explore the platform and discover all the features available to enhance your exam experience.\n\nThe Exam Bridge Team`
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('SMTP response:', error.response);
    }
    return false;
  }
};

module.exports = {
  sendWelcomeEmail
};