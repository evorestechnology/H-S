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

export const sendPasswordResetEmail = async (to, name, resetLink) => {
  const transporter = createTransporter();
  const from = process.env.MAIL_FROM || 'noreply@hiandshi.shop';

  if (!transporter) {
    console.warn('SMTP credentials not configured. Password reset email skipped.');
    return { skipped: true };
  }

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset your H&S password',
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="margin-bottom: 16px;">Reset your password</h2>
        <p>Hello ${name || 'there'},</p>
        <p>We received a request to reset the password for your H&S account.</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; background: #111; color: #fff; padding: 12px 18px; text-decoration: none; border-radius: 4px; margin: 12px 0;">
            Reset Password
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>Regards,<br />H&S Team</p>
      </div>
    `,
  });

  return { skipped: false };
};
