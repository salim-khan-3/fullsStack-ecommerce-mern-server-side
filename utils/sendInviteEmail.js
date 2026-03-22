// utils/sendInviteEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInviteEmail = async (toEmail, inviteLink) => {
  await transporter.sendMail({
    from: `"ShopZone Super Admin" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "You've been invited as Admin",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#1e3a8a;">Admin Invitation</h2>
        <p style="color:#6b7280;">You have been invited to join as an <strong>Admin</strong>. Click the button below to set up your account.</p>
        <p style="color:#ef4444;font-size:13px;">⚠️ This link expires in <strong>24 hours</strong>.</p>
        <a href="${inviteLink}" style="display:inline-block;margin-top:16px;background:#1e3a8a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Set Up My Account
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">If you didn't expect this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendInviteEmail;