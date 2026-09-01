const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { TransactionalEmailsClient } = require("@getbrevo/brevo/transactionalEmails");

/**
 * TransactionalEmailsApi - Brevo SDK client class wrapper
 */
class TransactionalEmailsApi extends TransactionalEmailsClient {
  constructor(options = {}) {
    const opts = typeof options === "string" ? { apiKey: options } : options;
    const key = (opts.apiKey || process.env.BREVO_API_KEY || "").trim().replace(/^["']|["']$/g, "");
    super({ apiKey: key, ...opts });
  }
}

/**
 * Reusable Email Dispatch Service using Brevo TransactionalEmailsApi SDK
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // Force load dotenv for sendEmail call context
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

  // Dynamic Key Check Log
  console.log("Brevo API Key detected during sendEmail call:", process.env.BREVO_API_KEY ? "YES" : "NO");

  const apiKey = (process.env.BREVO_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  const rawSenderEmail = (process.env.SENDER_EMAIL || "").trim().replace(/^["']|["']$/g, "");
  const senderEmail = rawSenderEmail || "mounikavelam@gmail.com";
  const senderName = "HealthForecast AI";

  // Only fall back to Sim Mode if BREVO_API_KEY is genuinely missing or empty
  if (!apiKey) {
    console.log("📧 [Brevo Sim Mode] Email dispatch simulated:");
    console.log(`   To: ${to}`);
    console.log(`   Sender: ${senderName} <${senderEmail}>`);
    console.log(`   Subject: ${subject}`);
    console.log(`   (Set BREVO_API_KEY in backend/.env for live Brevo delivery)`);
    return { success: true, simulated: true };
  }

  // Format recipient list for Brevo API
  const recipients = Array.isArray(to)
    ? to.map((recipient) => (typeof recipient === "string" ? { email: recipient.trim() } : recipient))
    : [{ email: typeof to === "string" ? to.trim() : to }];

  try {
    // Initialize Brevo client dynamically inside function
    const apiInstance = new TransactionalEmailsApi({ apiKey });

    const sendSmtpEmail = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: recipients,
      subject,
      htmlContent: html || (text ? `<p>${text}</p>` : undefined),
      textContent: text,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    const messageId = response?.messageId || response?.messageIds?.[0] || "delivered";

    console.log(`📧 Email delivered successfully via Brevo to ${to}: ${messageId}`);
    return { success: true, messageId, response };
  } catch (error) {
    console.error(`❌ Brevo Email Delivery Error: ${error.message}`);

    const statusCode = error.statusCode || error.status || error.response?.status;
    if (statusCode) {
      console.error(`   HTTP Status Code: ${statusCode}`);
    }

    const responseBody = error.body || error.response?.body;
    if (responseBody) {
      console.error(`   API Response Body:`, JSON.stringify(responseBody, null, 2));
    }

    return {
      success: false,
      error: error.message,
      statusCode,
      details: responseBody,
    };
  }
};

module.exports = sendEmail;
module.exports.TransactionalEmailsApi = TransactionalEmailsApi;
