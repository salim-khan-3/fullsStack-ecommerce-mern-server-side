// utils/sendOtpEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"ShopZone" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your OTP Verification Code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#4c3585;margin-bottom:8px;">Email Verification</h2>
        <p style="color:#6b7280;margin-bottom:24px;">Use the OTP below to verify your account. It expires in <strong>10 minutes</strong>.</p>
        <div style="background:#f3f0ff;border-radius:8px;padding:20px;text-align:center;letter-spacing:10px;font-size:32px;font-weight:bold;color:#4c3585;">
          ${otp}
        </div>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendOtpEmail;