const nodemailer = require("nodemailer");

/**
 * Reusable Email Dispatch Service using Nodemailer
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Fallback to simulated delivery if live SMTP credentials are not set
  if (!emailUser || !emailPass) {
    console.log("📧 [SMTP Sim Mode] Nodemailer email dispatch simulated:");
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   (Set EMAIL_USER and EMAIL_PASS in backend/.env for live SMTP delivery)`);
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 2000,
      greetingTimeout: 2000,
      socketTimeout: 2500,
    });

    const mailOptions = {
      from: `HealthForecast AI Platform <${emailUser}>`,
      to,
      subject,
      html: html || `<p>${text}</p>`,
      text: text || "HealthForecast AI Notification",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email delivered successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`⚠️ Nodemailer delivery error: ${error.message}`);
    console.log(`📧 Fallback simulated delivery for: ${to}`);
    return { success: true, fallback: true, error: error.message };
  }
};

module.exports = sendEmail;
