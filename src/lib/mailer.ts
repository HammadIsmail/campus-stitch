import nodemailer from "nodemailer";
import dns from "dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const host = process.env.MAIL_SERVER || "smtp.gmail.com";
const port = Number(process.env.MAIL_PORT || 465);
const secure = port === 465 || process.env.MAIL_SSL_TLS === "True";
const user = process.env.MAIL_USERNAME || "ranahammadismail@gmail.com";
const pass = process.env.MAIL_PASSWORD || "rxrv vzjx ljqg bvwt";
const from = process.env.MAIL_FROM || "ranahammadismail@gmail.com";

export const transporter = nodemailer.createTransport(
  host.includes("gmail")
    ? {
        service: "gmail",
        auth: {
          user,
          pass,
        },
      }
    : {
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      }
);

/**
 * Send a 6-digit OTP verification email via Gmail SMTP
 */
export async function sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  const mailOptions = {
    from: `"CampuStitch UET" <${from}>`,
    to: toEmail,
    subject: `${otp} is your CampuStitch verification code`,
    text: `Your CampuStitch 6-digit verification code is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CampuStitch Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 15px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="480" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #f4f4f5;">
                      <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background-color: #000000; color: #ffffff; border-radius: 12px; font-weight: 900; font-size: 18px; letter-spacing: -0.5px;">
                        CS
                      </div>
                      <h1 style="margin: 16px 0 4px 0; font-size: 20px; font-weight: 800; color: #09090b; letter-spacing: -0.5px;">
                        CampuStitch UET Lahore
                      </h1>
                      <p style="margin: 0; font-size: 13px; color: #71717a;">
                        Student Commute & Campus Marketplace
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px 32px 28px 32px; text-align: center;">
                      <p style="margin: 0 0 16px 0; font-size: 14px; color: #27272a; line-height: 1.5;">
                        Here is your 6-digit one-time passcode to sign in:
                      </p>

                      <!-- OTP Box -->
                      <div style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 16px 28px; border-radius: 14px; font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; margin: 8px 0 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                        ${otp}
                      </div>

                      <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                        This passcode is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 32px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center;">
                      <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.4;">
                        If you did not request this login, please ignore this email.<br>
                        CampuStitch &bull; UET Lahore Verified Student Life
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
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Nodemailer send error:", error);
    throw error;
  }
}

/**
 * Send a 6-digit Password Reset OTP email via Gmail SMTP
 */
export async function sendPasswordResetEmail(toEmail: string, otp: string): Promise<boolean> {
  const mailOptions = {
    from: `"CampuStitch UET" <${from}>`,
    to: toEmail,
    subject: `${otp} is your CampuStitch Password Reset Code`,
    text: `Your CampuStitch password reset code is: ${otp}. It will expire in 15 minutes. If you did not request this, please ignore this email.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your CampuStitch Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 15px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #f4f4f5;">
                      <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background-color: #000000; color: #ffffff; border-radius: 12px; font-weight: 900; font-size: 18px; letter-spacing: -0.5px;">
                        CS
                      </div>
                      <h1 style="margin: 16px 0 4px 0; font-size: 20px; font-weight: 800; color: #09090b; letter-spacing: -0.5px;">
                        Reset Your Password
                      </h1>
                      <p style="margin: 0; font-size: 13px; color: #71717a;">
                        CampuStitch UET Lahore Account Security
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px 32px 28px 32px; text-align: center;">
                      <p style="margin: 0 0 16px 0; font-size: 14px; color: #27272a; line-height: 1.5;">
                        We received a request to reset the password for your student account (<strong>${toEmail}</strong>). Enter this 6-digit code on the reset page:
                      </p>

                      <!-- OTP Box -->
                      <div style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 16px 28px; border-radius: 14px; font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; margin: 8px 0 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                        ${otp}
                      </div>

                      <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                        This code is valid for <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email — your password remains unchanged.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 32px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center;">
                      <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.4;">
                        CampuStitch &bull; Smart Student Mobility & Quad Platform<br>
                        UET Lahore Verified Student Network
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
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Nodemailer sendPasswordResetEmail error:", error);
    throw error;
  }
}

/**
 * Send contact inquiry notification to support and automated confirmation to sender
 */
export async function sendContactFormEmail({
  name,
  email,
  category,
  subject,
  message,
  ticketRef,
}: {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  ticketRef: string;
}): Promise<boolean> {
  const supportEmail = from;

  // 1. Send receipt notification to user
  const userMailOptions = {
    from: `"CampuStitch Support" <${from}>`,
    to: email,
    replyTo: supportEmail,
    subject: `[${ticketRef}] We received your inquiry: ${subject}`,
    text: `Hi ${name},\n\nThank you for reaching out to CampuStitch Support.\n\nYour Ticket ID is: ${ticketRef}\nSubject: ${subject}\nCategory: ${category}\n\nOur campus support team typically replies within 24 hours.\n\nSummary of your message:\n${message}\n\nWarm regards,\nCampuStitch Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 24px; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <tr>
              <td style="padding: 24px 32px; background-color: #09090b; color: #ffffff;">
                <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">CampuStitch Support</div>
                <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px;">Ticket Confirmation &bull; ${ticketRef}</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px;">
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Hello <strong>${name}</strong>,</p>
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #52525b; line-height: 1.6;">
                  We have received your message regarding <strong>${subject}</strong>. A support ticket has been created and assigned to our university operations desk.
                </p>
                <div style="background-color: #f4f4f5; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; font-weight: 700;">Ticket Details</div>
                  <div style="font-size: 13px; color: #09090b; font-weight: 600; margin-top: 4px;">Reference: <span style="font-family: monospace;">${ticketRef}</span></div>
                  <div style="font-size: 13px; color: #09090b; font-weight: 600; margin-top: 2px;">Category: ${category}</div>
                </div>
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #27272a;">Your Message:</p>
                <div style="background-color: #fafafa; border-left: 3px solid #09090b; padding: 12px 16px; font-size: 12px; color: #3f3f46; line-height: 1.5; white-space: pre-wrap;">${message}</div>
                <p style="margin: 24px 0 0 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                  We respond within 24 hours on campus working days.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center; font-size: 11px; color: #a1a1aa;">
                CampuStitch &bull; Multi-Tenant Student SuperApp &bull; Pakistan
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(userMailOptions);
    return true;
  } catch (error) {
    console.error("Nodemailer sendContactFormEmail error:", error);
    // Don't crash if SMTP fails in local dev; ticket still logged
    return false;
  }
}

