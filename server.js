import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory OTP store: { email: { otp, expiresAt, name } }
const otpStore = {};

// Create SMTP transporter if credentials exist
const getTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass
    }
  });
};

// Route: Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, name, type } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  // Generate 6-digit OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  // Save to memory store
  otpStore[email.toLowerCase()] = { otp, expiresAt, name };

  const transporter = getTransporter();

  // If SMTP is NOT configured, run in simulated mode
  if (!transporter) {
    console.log(`[AUTH SIMULATOR] OTP for ${email}: ${otp}`);
    return res.json({
      success: true,
      simulated: true,
      otp: otp,
      message: 'SMTP credentials (GMAIL_USER/GMAIL_PASS) not configured. Verification code printed here for evaluation.'
    });
  }

  // Live Gmail SMTP dispatch
  try {
    const mailOptions = {
      from: `"AIForMSME Studio" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `AIForMSME Verification Code: ${otp}`,
      html: `
        <div style="background-color: #0f172a; color: #f8fafc; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #06b6d4; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">AI<span style="color:#ffffff;">ForMSME</span></h2>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Security & Onboarding Portal</p>
          </div>
          
          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px;">
            <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-top: 0;">
              Hello ${name || 'User'},
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
              Welcome to the AIForMSME application. Your security verification code for logging in or creating your account is:
            </p>
            
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 6px; color: #ec4899; margin: 28px 0; text-shadow: 0 0 10px rgba(236,72,153,0.15);">
              ${otp}
            </div>
            
            <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 0;">
              This verification code is valid for <strong>5 minutes</strong>. If you did not initiate this login request, please discard this email.
            </p>
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; margin-top: 32px; font-size: 11px; color: #64748b; text-align: center;">
            &copy; 2026 AIForMSME Studio. Empowering Micro, Small, and Medium Enterprises.
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[AUTH] Live OTP sent successfully to ${email}`);
    
    return res.json({
      success: true,
      simulated: false,
      message: 'Verification code dispatched to your Gmail Inbox.'
    });

  } catch (error) {
    console.error('[AUTH ERROR] SMTP Transport failed:', error);
    
    // If SMTP fails (e.g. bad key, authentication failure), fallback to simulation so the app doesn't break
    return res.status(500).json({
      success: false,
      message: `Failed to connect to SMTP server: ${error.message}. Please verify your GMAIL_USER and GMAIL_PASS app password values in the .env file.`
    });
  }
});

// Route: Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
  }

  const stored = otpStore[email.toLowerCase()];

  if (!stored) {
    return res.status(400).json({ success: false, message: 'No verification code requested for this email address.' });
  }

  if (Date.now() > stored.expiresAt) {
    delete otpStore[email.toLowerCase()];
    return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
  }

  if (stored.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Incorrect verification code. Please try again.' });
  }

  // Success: generate user session payload and clear code
  const userPayload = {
    email: email.toLowerCase(),
    name: stored.name || email.split('@')[0],
    role: 'Client Operator',
    token: 'mock-session-jwt-token-' + Date.now()
  };

  delete otpStore[email.toLowerCase()];

  return res.json({
    success: true,
    user: userPayload,
    message: 'Authentication successful. Welcome aboard!'
  });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Express Server running on http://localhost:${PORT}`);
});
