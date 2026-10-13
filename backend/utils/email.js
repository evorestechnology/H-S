import nodemailer from 'nodemailer';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

const brandName = 'H&S';
const brandFrom = process.env.SMTP_FROM || process.env.MAIL_FROM || `${brandName} Store <notifications@hiandshi.shop>`;

export const sendPasswordResetEmail = async (to, name, resetLink) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('SMTP credentials not configured. Password reset email skipped.');
    return { skipped: true };
  }

  await transporter.sendMail({
    from: brandFrom,
    to,
    subject: `Reset your ${brandName} password`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="margin-bottom: 16px;">Reset your password</h2>
        <p>Hello ${name || 'there'},</p>
        <p>We received a request to reset the password for your ${brandName} account.</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; background: #111; color: #fff; padding: 12px 18px; text-decoration: none; border-radius: 4px; margin: 12px 0;">
            Reset Password
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>Regards,<br />${brandName} Team</p>
      </div>
    `,
  });

  return { skipped: false };
};

/**
 * sendOtpEmail — sends a 6-digit OTP for password reset.
 */
export const sendOtpEmail = async (to, name, otp) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[Email] SMTP credentials not configured. OTP email skipped. OTP:', otp);
    return { skipped: true, otp };
  }

  await transporter.sendMail({
    from: brandFrom,
    to,
    subject: `Your ${brandName} Password Reset OTP`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
        
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -1px; margin: 0;">${brandName}</h1>
          <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Password Reset</p>
        </div>

        <div style="border: 1px solid #e5e7eb; padding: 32px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px;">Hello <strong>${name || 'there'}</strong>,</p>
          <p style="color: #555; margin: 0 0 24px;">
            We received a request to reset your ${brandName} account password. 
            Use the OTP below to proceed. This code is valid for <strong>10 minutes</strong>.
          </p>

          <div style="background: #f9f9f9; border: 2px dashed #111; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #666;">Your One-Time Password</p>
            <p style="font-size: 42px; font-weight: 900; letter-spacing: 10px; margin: 0; color: #111; font-family: 'Courier New', monospace;">
              ${otp}
            </p>
          </div>

          <p style="color: #888; font-size: 13px; margin: 0;">
            ⚠️ Do not share this OTP with anyone. ${brandName} will never ask for your OTP.
          </p>
        </div>

        <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">
          If you did not request a password reset, you can safely ignore this email.<br />
          Your account remains secure.
        </p>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 16px; text-align: center;">
          <p style="color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
            ${brandName} &mdash; 2026 &copy; ASAT || EvoRES Technology LLP
          </p>
        </div>
      </div>
    `,
  });

  return { skipped: false };
};
