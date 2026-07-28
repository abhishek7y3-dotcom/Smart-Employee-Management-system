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

// User ko notify karna ki admin ne uska account create kiya hai, password ke sath
export async function sendAdminAccountCreationEmail(email: string, name: string, pass: string): Promise<void> {
  try {
    const transporter = await getTransporter();
    const SMTP_FROM = process.env.SMTP_FROM || 'noreply@employeemanager.com';

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: `Welcome to Employee Task Manager, ${name}!`,
      html: `
        <div style="font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 550px; margin: 0 auto; padding: 40px; border: 1px solid #e4e4e7; border-radius: 24px; background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-flex; justify-content: center; align-items: center; width: 64px; height: 64px; border-radius: 50%; background: #0f172a; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.3);">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline>
              </svg>
            </div>
            <h1 style="color: #090a0b; font-size: 26px; font-weight: 800; margin: 20px 0 0 0; letter-spacing: -0.5px;">Account Created</h1>
          </div>
          
          <div style="background-color: #ffffff; border: 1px solid #f4f4f5; border-radius: 16px; padding: 30px; margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">
            <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong style="color: #18181b;">${name}</strong>,</p>
            <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">An administrator has just set up a new account for you on Employee Task Manager. You can now log in using the credentials below:</p>
            
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
              <p style="margin: 0 0 20px 0; color: #0f172a; font-size: 18px; font-weight: 700;">${email}</p>
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Temporary Password</p>
              <p style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: 2px;">${pass}</p>
            </div>
            
            <p style="color: #ef4444; font-size: 14px; font-weight: 600; text-align: center; margin: 0;">Please change your password immediately after logging in.</p>
          </div>
          
          <p style="color: #71717a; font-size: 13px; text-align: center; margin: 0;">If you need assistance, please contact your administrator.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\n✉️ [EMAIL] Sent account creation email to ${email}. MessageId: ${info.messageId}\n`);
    
    // If using Ethereal test account, output preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n=============================================================');
      console.log(`[TEST EMAIL SENT] Account Creation preview link:`);
      console.log(previewUrl);
      console.log(`Temporary Password is: ${pass}`);
      console.log('=============================================================\n');
    }
  } catch (err) {
    console.error('mailer.ts: Error sending account creation email:', err);
    throw err;
  }
}

export async function sendAccountDeactivationEmail(email: string, name: string): Promise<void> {
  try {
    const transporter = await getTransporter();
    const SMTP_FROM = process.env.SMTP_FROM || 'noreply@employeemanager.com';

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: `Account Deactivation - Employee Task Manager`,
      text: `Hello Dear ${name},

We would like to inform you that your Employee Management System account has been deactivated by an administrator.

You will no longer be able to sign in or access your dashboard.

If you require additional information or believe this action was taken in error, please contact your HR department or System Administrator.

If you have any questions regarding this action, please contact your HR department or System Administrator.

Regards,
Employee Management System`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\n✉️ [EMAIL] Sent account deactivation email to ${email}. MessageId: ${info.messageId}\n`);
    
    // If using Ethereal test account, output preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n=============================================================');
      console.log(`[TEST EMAIL SENT] Account Deactivation preview link:`);
      console.log(previewUrl);
      console.log('=============================================================\n');
    }
  } catch (err) {
    console.error('mailer.ts: Error sending account deactivation email:', err);
    throw err;
  }
}

export async function sendAccountReactivationEmail(email: string, name: string): Promise<void> {
  try {
    const transporter = await getTransporter();
    const SMTP_FROM = process.env.SMTP_FROM || 'noreply@employeemanager.com';

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: `Account Reactivation - Employee Task Manager`,
      text: `Dear ${name},

Your Employee Management System account has been successfully reactivated.

You now have full access to the system and its available features based on your assigned role.

If you need any assistance, please contact your HR department or System Administrator.

Regards,
Employee Management System`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\n✉️ [EMAIL] Sent account reactivation email to ${email}. MessageId: ${info.messageId}\n`);
    
    // If using Ethereal test account, output preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n=============================================================');
      console.log(`[TEST EMAIL SENT] Account Reactivation preview link:`);
      console.log(previewUrl);
      console.log('=============================================================\n');
    }
  } catch (err) {
    console.error('mailer.ts: Error sending account reactivation email:', err);
    throw err;
  }
}

export async function sendAccountPermanentDeletionEmail(email: string, name: string): Promise<void> {
  try {
    const transporter = await getTransporter();
    const SMTP_FROM = process.env.SMTP_FROM || 'noreply@employeemanager.com';

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: `Account Permanently Deleted - Employee Task Manager`,
      text: `Dear ${name},

This is to inform you that your Employee Management System account has been permanently deleted by an administrator.

As a result:

Your access to the Employee Management System has been permanently revoked.
All data associated with your account has been permanently removed from the system.
This action is irreversible, and your account cannot be restored.

If you believe this action was taken in error or you require further clarification, please contact your organization's administrator or the IT Support team.

Thank you.

Regards,
Employee Management System (EMS)
System Administration Team`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\n✉️ [EMAIL] Sent account permanent deletion email to ${email}. MessageId: ${info.messageId}\n`);
    
    // If using Ethereal test account, output preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n=============================================================');
      console.log(`[TEST EMAIL SENT] Account Permanent Deletion preview link:`);
      console.log(previewUrl);
      console.log('=============================================================\n');
    }
  } catch (err) {
    console.error('mailer.ts: Error sending account permanent deletion email:', err);
    throw err;
  }
}

export async function sendLeaveApprovalEmail(
  email: string,
  employeeName: string,
  approverName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  totalDays: number
): Promise<void> {
  try {
    const transporter = await getTransporter();
    const SMTP_FROM = process.env.SMTP_FROM || 'noreply@employeemanager.com';

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: `Leave Request Approved - Employee Task Manager`,
      text: `Dear ${employeeName},

We are pleased to inform you that your leave request has been approved by ${approverName}.

Leave Details

* Leave Type: ${leaveType}
* From: ${startDate}
* To: ${endDate}
* Total Days: ${totalDays}
* Status: Approved

Please ensure that any ongoing tasks are appropriately handed over (if applicable) and coordinate with your reporting manager to ensure a smooth workflow during your absence.

We wish you a pleasant and restful leave.

If you have any questions, please contact the HR department or your reporting manager.

Thank you.

Kind regards,

Employee Management System
On behalf of HR & Administration Team

*This is an automated email. Please do not reply to this message.*`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\n✉️ [EMAIL] Sent leave approval email to ${email}. MessageId: ${info.messageId}\n`);
    
    // If using Ethereal test account, output preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n=============================================================');
      console.log(`[TEST EMAIL SENT] Leave Approval preview link:`);
      console.log(previewUrl);
      console.log('=============================================================\n');
    }
  } catch (err) {
    console.error('mailer.ts: Error sending leave approval email:', err);
    throw err;
  }
}

export async function sendLeaveRejectionEmail(
  email: string,
  employeeName: string,
  approverName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  totalDays: number,
  rejectionReason: string
): Promise<void> {
  try {
    const transporter = await getTransporter();
    const SMTP_FROM = process.env.SMTP_FROM || 'noreply@employeemanager.com';

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: `Leave Request Rejected - Employee Task Manager`,
      text: `Dear ${employeeName},

We regret to inform you that your leave request has been rejected by ${approverName}.

Leave Details

* Leave Type: ${leaveType}
* From: ${startDate}
* To: ${endDate}
* Total Days: ${totalDays}
* Status: Rejected

Reason for Rejection (if applicable):
${rejectionReason || 'No specific reason provided.'}

If you require additional clarification or believe the request should be reconsidered, please contact your reporting manager or the HR department. You may also submit a revised leave request if appropriate.

Thank you for your understanding.

Kind regards,

Employee Management System
On behalf of HR & Administration Team

*This is an automated email. Please do not reply to this message.*`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\n✉️ [EMAIL] Sent leave rejection email to ${email}. MessageId: ${info.messageId}\n`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n=============================================================');
      console.log(`[TEST EMAIL SENT] Leave Rejection preview link:`);
      console.log(previewUrl);
      console.log('=============================================================\n');
    }
  } catch (err) {
    console.error('mailer.ts: Error sending leave rejection email:', err);
    throw err;
  }
}
