const nodemailer = require("nodemailer");

/**
 * Send email using SMTP
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} Nodemailer info object
 */
const sendMail = async ({ to, subject, html }) => {
  // Validate required fields
  if (!to) {
    throw new Error("Recipient email is required");
  }

  if (!subject) {
    throw new Error("Email subject is required");
  }

  if (!html) {
    throw new Error("Email content (html) is required");
  }

  // Check environment variables
  if (!process.env.EMAIL_NAME || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error(
      "Email configuration missing. Check EMAIL_NAME and EMAIL_APP_PASSWORD in .env",
    );
  }

  // Create transporter with config from env (flexible)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    // Add timeout and debug options
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log("✅ Email transporter ready");

    // Send email
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || `"E-commerce" <${process.env.EMAIL_NAME}>`,
      to: to,
      subject: subject,
      html: html,
      // Optional: Add text version for email clients that don't support HTML
      text: html.replace(/<[^>]*>/g, ""), // Simple HTML to text conversion
    });

    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`   Message ID: ${info.messageId}`);

    return info;
  } catch (error) {
    console.log(error);
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = sendMail;
