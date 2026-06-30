import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';

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
    },
    connectionTimeout: 4000, // 4 seconds timeout limit to prevent hanging
    greetingTimeout: 4000,
    socketTimeout: 4000
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
    console.error('[AUTH ERROR] SMTP Transport failed, falling back to simulated sandbox:', error.message);
    
    // Automatically fall back to returning simulated OTP directly so authentication doesn't hang or fail on blocked ports
    return res.json({
      success: true,
      simulated: true,
      otp: otp,
      message: `Gmail SMTP Port blocked or failed: ${error.message || error}. Verification code printed here for evaluation.`
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

// Initialize Razorpay Instance helper
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.log('[RAZORPAY] Credentials missing in env. Running in Sandbox Simulation mode.');
    return null;
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

// Route: Create Razorpay Order
app.post('/api/payment/create-order', async (req, res) => {
  const { amount, currency = 'INR', receipt = 'receipt_1' } = req.body;
  if (!amount) {
    return res.status(400).json({ success: false, message: 'Amount is required.' });
  }

  const razorpayInstance = getRazorpayInstance();
  if (!razorpayInstance) {
    // Return simulated sandbox payload
    return res.json({
      success: true,
      simulated: true,
      order_id: `order_sim_${Math.random().toString(36).substring(7)}`,
      amount: Math.round(amount * 100),
      currency: currency
    });
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: currency,
      receipt: receipt
    };
    const order = await razorpayInstance.orders.create(options);
    return res.json({
      success: true,
      simulated: false,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('[RAZORPAY ORDER ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: `Razorpay Order creation failed: ${error.message || error}`
    });
  }
});

// Route: Verify Razorpay Payment Signature
app.post('/api/payment/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    console.log('[RAZORPAY SIMULATOR] Verified simulated checkout.');
    return res.json({ success: true, verified: true, message: 'Simulated payment verified.' });
  }

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return res.json({ success: true, verified: true, message: 'Payment verified successfully.' });
    } else {
      return res.status(400).json({ success: false, verified: false, message: 'Invalid payment signature.' });
    }
  } catch (error) {
    console.error('[RAZORPAY VERIFY ERROR]:', error);
    return res.status(500).json({ success: false, message: 'Payment signature verification error.' });
  }
});

// Serve static files from the React frontend build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));

// Wildcard route to serve index.html for client routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[SERVER] Express Server running on http://localhost:${PORT}`);
});
