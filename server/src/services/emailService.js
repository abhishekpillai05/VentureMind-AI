import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter = null;

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  const visible = local.length > 2 ? local.slice(0, 2) : local.slice(0, 1);
  return `${visible}***@${domain}`;
};

export const getTransporter = () => {
  if (!transporter) {
    const isGmail = ENV.SMTP.HOST.includes('gmail.com');
    const port = ENV.SMTP.PORT;

    transporter = nodemailer.createTransport({
      host: ENV.SMTP.HOST,
      port: port,
      secure: port === 465, // true for 465, false for 587
      requireTLS: port === 587,
      auth: {
        user: ENV.SMTP.USER,
        pass: ENV.SMTP.PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 12000, // 12 seconds timeout
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }
  return transporter;
};

// Verify SMTP connection on demand or during server startup
export const verifySMTPConnection = async () => {
  if (!ENV.SMTP.USER || !ENV.SMTP.PASS) {
    console.warn('⚠️  SMTP credentials not configured in server/.env (Emails will be simulated).');
    return false;
  }

  try {
    const client = getTransporter();
    await client.verify();
    console.log(
      `✅ SMTP Connection Verified: Authenticated successfully with ${ENV.SMTP.HOST}:${ENV.SMTP.PORT} as ${maskEmail(
        ENV.SMTP.USER
      )}`
    );
    return true;
  } catch (error) {
    console.error('❌ SMTP Connection Test Failed:');
    console.error(`   Host: ${ENV.SMTP.HOST}:${ENV.SMTP.PORT}`);
    console.error(`   User: ${maskEmail(ENV.SMTP.USER)}`);
    console.error(`   Reason: ${error.message} (Code: ${error.code || 'N/A'})`);
    return false;
  }
};

export const sendOTPEmail = async (toEmail, userName, otp) => {
  const maskedTo = maskEmail(toEmail);

  if (!ENV.SMTP.USER || !ENV.SMTP.PASS) {
    console.warn(`⚠️  SMTP not configured. Development OTP for ${maskedTo}: [${otp}]`);
    return { success: true, simulated: true };
  }

  const senderAddress = ENV.SMTP.FROM_EMAIL || ENV.SMTP.USER;
  const mailOptions = {
    from: `"${ENV.SMTP.FROM_NAME}" <${senderAddress}>`,
    to: toEmail,
    subject: `${otp} is your VentureMind AI verification code`,
    text: `Hi ${userName || 'Founder'},\n\nYour VentureMind AI verification code is: ${otp}\n\nThis code expires in 5 minutes. Do not share it with anyone.\n\nBest,\nThe VentureMind AI Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VentureMind AI Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #070b14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #070b14; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 520px; background-color: #0d1526; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden;" cellspacing="0" cellpadding="0">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VentureMind AI</h1>
                    <p style="color: #c7d2fe; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">AI Entrepreneur Trainer & Startup Simulator</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 32px 28px 32px;">
                    <h2 style="color: #f8fafc; font-size: 18px; margin: 0 0 12px 0; font-weight: 700;">Email Verification</h2>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                      Hi ${userName || 'Founder'},<br>
                      Welcome to VentureMind AI. Use the verification code below to confirm your email and activate your startup workspace.
                    </p>

                    <!-- OTP Code Card -->
                    <table role="presentation" width="100%" style="background-color: #151e33; border: 1px solid #293856; border-radius: 12px; margin: 0 0 24px 0;" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="padding: 24px 16px;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #818cf8; font-weight: 700; margin-bottom: 8px;">Your 6-Digit Code</div>
                          <div style="font-size: 38px; font-weight: 800; color: #ffffff; letter-spacing: 10px; font-family: Consolas, 'Courier New', monospace; margin: 0;">${otp}</div>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 16px 0;">
                      ⏱️ This code expires in <strong style="color: #94a3b8;">5 minutes</strong>.<br>
                      🔒 If you did not create a VentureMind AI account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #090e1a; padding: 20px 32px; border-top: 1px solid #172138; text-align: center;">
                    <p style="color: #475569; font-size: 11px; margin: 0; line-height: 1.4;">
                      © ${new Date().getFullYear()} VentureMind AI. DBCE Hackathon Project.<br>
                      Empowering founders to validate, simulate, and build.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    const client = getTransporter();
    const info = await client.sendMail(mailOptions);
    console.log(`📧 OTP email dispatched successfully to ${maskedTo} [MessageId: ${info.messageId}]`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to deliver OTP email to ${maskedTo}:`);
    console.error(`   Error: ${error.message} (Code: ${error.code || 'UNKNOWN'})`);

    // In development mode: if delivery fails, still provide diagnostic info, but throw an error so the API caller knows
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

export const sendPasswordResetOTPEmail = async (toEmail, userName, otp) => {
  const maskedTo = maskEmail(toEmail);

  if (!ENV.SMTP.USER || !ENV.SMTP.PASS) {
    console.warn(`⚠️  SMTP not configured. Password Reset OTP for ${maskedTo}: [${otp}]`);
    return { success: true, simulated: true };
  }

  const senderAddress = ENV.SMTP.FROM_EMAIL || ENV.SMTP.USER;
  const mailOptions = {
    from: `"${ENV.SMTP.FROM_NAME}" <${senderAddress}>`,
    to: toEmail,
    subject: `${otp} is your VentureMind AI password reset code`,
    text: `Hi ${userName || 'Founder'},\n\nWe received a request to reset your VentureMind AI password.\n\nYour 6-digit verification code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, please ignore this email.\n\nBest,\nThe VentureMind AI Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VentureMind AI Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #070b14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #070b14; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 520px; background-color: #0d1526; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden;" cellspacing="0" cellpadding="0">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VentureMind AI</h1>
                    <p style="color: #c7d2fe; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Account Security & Recovery</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 32px 28px 32px;">
                    <h2 style="color: #f8fafc; font-size: 18px; margin: 0 0 12px 0; font-weight: 700;">Password Reset Request</h2>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                      Hi ${userName || 'Founder'},<br>
                      We received a request to reset the password for your VentureMind AI account. Use the 6-digit verification code below to authorize this change:
                    </p>

                    <!-- OTP Code Card -->
                    <table role="presentation" width="100%" style="background-color: #151e33; border: 1px solid #293856; border-radius: 12px; margin: 0 0 24px 0;" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="padding: 24px 16px;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #818cf8; font-weight: 700; margin-bottom: 8px;">Password Reset Code</div>
                          <div style="font-size: 38px; font-weight: 800; color: #ffffff; letter-spacing: 10px; font-family: Consolas, 'Courier New', monospace; margin: 0;">${otp}</div>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 16px 0;">
                      ⏱️ This code expires in <strong style="color: #94a3b8;">10 minutes</strong>.<br>
                      🔒 If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #090e1a; padding: 20px 32px; border-top: 1px solid #172138; text-align: center;">
                    <p style="color: #475569; font-size: 11px; margin: 0; line-height: 1.4;">
                      © ${new Date().getFullYear()} VentureMind AI. All rights reserved.<br>
                      Automated security notification · Do not reply
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    const client = getTransporter();
    const info = await client.sendMail(mailOptions);
    console.log(`📧 Password reset OTP email dispatched successfully to ${maskedTo} [MessageId: ${info.messageId}]`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to deliver password reset OTP email to ${maskedTo}:`);
    console.error(`   Error: ${error.message} (Code: ${error.code || 'UNKNOWN'})`);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};
