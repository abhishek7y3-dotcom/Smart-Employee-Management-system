import nodemailer from 'nodemailer';

let testAccountTransporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  // Read env vars lazily (after dotenv.config() has run)
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;

  // Use custom SMTP credentials if configured
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  // Fallback to auto-created Ethereal test account
  if (!testAccountTransporter) {
    console.log('mailer.ts: Custom SMTP credentials not found in env. Creating a test Ethereal Mail account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      testAccountTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`mailer.ts: Created test account - user: ${testAccount.user}`);
    } catch (err) {
      console.error('mailer.ts: Failed to create test Ethereal Mail account:', err);
      throw err;
    }
  }

  return testAccountTransporter;
}

// User ko naya account verify karne ke liye 6-digit OTP email par bhejna
export async function sendVerificationOtp(email: string, name: string, otp: string): Promise<void> {
  try {
    const transporter = await getTransporter();
    const SMTP_FROM = process.env.SMTP_FROM || 'noreply@employeemanager.com';

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: `${otp} is your verification code - Employee Task Manager`,
      html: `
        <div style="font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 550px; margin: 0 auto; padding: 40px; border: 1px solid #e4e4e7; border-radius: 24px; background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <div style="background-color: #2563eb; color: white; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px;">✓</div>
            <span style="font-weight: 800; font-size: 18px; color: #0f172a; tracking-tight: -0.025em;">Employee Task Manager</span>
          </div>
          
          <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: -0.02em;">Verify Your Email Address</h2>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">Hello ${name},</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">Please use the 6-digit verification code below to activate your account and complete your registration:</p>
          
          <div style="background: #f1f5f9; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 28px; border: 1px solid #e2e8f0;">
            <span style="font-size: 36px; font-weight: 800; color: #2563eb; letter-spacing: 0.25em; font-family: monospace; display: inline-block; padding-left: 0.25em;">${otp}</span>
          </div>
          
          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0; text-align: center;">
            This one-time passcode is valid for <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            &copy; 2026 Employee Task Manager. All rights reserved.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`mailer.ts: Verification OTP sent successfully to ${email}`);

    // If using Ethereal test account, output preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n=============================================================');
      console.log(`[TEST EMAIL SENT] Verification OTP preview link:`);
      console.log(previewUrl);
      console.log(`Your 6-Digit OTP Code is: ${otp}`);
      console.log('=============================================================\n');
    }
  } catch (error) {
    console.error('mailer.ts: Error sending verification OTP:', error);
    throw error;
  }
}

// Agar user password bhool jaye, toh password reset karne ke liye email par OTP bhejna
export async function sendResetPasswordOtp(email: string, name: string, otp: string): Promise<void> {
  try {
    const transporter = await getTransporter();
    const SMTP_FROM = process.env.SMTP_FROM || 'noreply@employeemanager.com';

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: `${otp} is your password reset code - Employee Task Manager`,
      html: `
        <div style="font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 550px; margin: 0 auto; padding: 40px; border: 1px solid #e4e4e7; border-radius: 24px; background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <div style="background-color: #2563eb; color: white; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px;">✓</div>
            <span style="font-weight: 800; font-size: 18px; color: #0f172a;">Employee Task Manager</span>
          </div>
          
          <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: -0.02em;">Reset Your Password</h2>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">Hello ${name},</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">We received a request to reset your password. Use the 6-digit OTP below to perform the action:</p>
          
          <div style="background: #f1f5f9; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 28px; border: 1px solid #e2e8f0;">
            <span style="font-size: 36px; font-weight: 800; color: #dc2626; letter-spacing: 0.25em; font-family: monospace; display: inline-block; padding-left: 0.25em;">${otp}</span>
          </div>
          
          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0; text-align: center;">
            This reset code is valid for <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            &copy; 2026 Employee Task Manager. All rights reserved.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`mailer.ts: Password Reset OTP sent successfully to ${email}`);

    // If using Ethereal test account, output preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n=============================================================');
      console.log(`[TEST EMAIL SENT] Password Reset OTP preview link:`);
      console.log(previewUrl);
      console.log(`Your 6-Digit Reset OTP Code is: ${otp}`);
      console.log('=============================================================\n');
    }
  } catch (error) {
    console.error('mailer.ts: Error sending password reset OTP:', error);
    throw error;
  }
}

