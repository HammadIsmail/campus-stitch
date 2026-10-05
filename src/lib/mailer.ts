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

