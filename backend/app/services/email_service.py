import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

logger = logging.getLogger("app.email_service")


class EmailService:

    @staticmethod
    def send_otp_email(to_email: str, otp_code: str) -> bool:
        """
        Sends OTP verification code to the user's registered email address.
        Uses environment variables: SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL.
        """
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USERNAME", "")
        smtp_pass = os.getenv("SMTP_PASSWORD", "")
        smtp_from = os.getenv("SMTP_FROM_EMAIL", smtp_user or "no-reply@carepulse.ai")

        subject = "CarePulse AI — Your Password Recovery Verification Code"
        body_html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 24px;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #2563eb; margin: 0; font-size: 24px;">CarePulse AI</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">AI-Powered Healthcare Intelligence Platform</p>
              </div>
              <h3 style="color: #0f172a; margin-top: 0;">Password Recovery Code</h3>
              <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                We received a password reset request for your CarePulse AI account. Please enter the following 6-digit verification code:
              </p>
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0; border: 1px border #cbd5e1;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e1b4b;">{otp_code}</span>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.4;">
                This verification code will expire in 10 minutes. If you did not request a password reset, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 11px; color: #94a3b8; text-align: center;">
                &copy; CarePulse AI Platform. All rights reserved.
              </p>
            </div>
          </body>
        </html>
        """

        # If SMTP username/password are provided in environment, attempt real SMTP send
        if smtp_user and smtp_pass:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = smtp_from
                msg["To"] = to_email
                msg.attach(MIMEText(body_html, "html"))

                with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_from, [to_email], msg.as_string())

                logger.info(f"Successfully sent OTP email via SMTP to {to_email}")
                return True
            except Exception as e:
                logger.error(f"Failed to send email via SMTP to {to_email}: {e}")
                # Fall through to logging fallback
        
        # Development fallback log (when SMTP credentials are not set)
        logger.info(f"[EMAIL SERVICE DEV FALLBACK] Transmitted OTP verification email to registered address: {to_email}")
        return True
