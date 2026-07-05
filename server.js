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

// In-memory persistent users store for operators (Starts completely empty)
const usersStore = {};

// Route: User Registration
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
  }

  const emailKey = email.toLowerCase().trim();
  if (usersStore[emailKey]) {
    return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please log in.' });
  }

  // Create new user profile in memory
  usersStore[emailKey] = {
    name: name.trim(),
    email: emailKey,
    password: password
  };

  console.log(`[AUTH] Registered new operator user account: ${emailKey}`);

  return res.json({
    success: true,
    user: {
      email: emailKey,
      name: name.trim(),
      role: 'Client Operator',
      token: 'session-jwt-' + Date.now()
    },
    message: 'Operator workspace created successfully!'
  });
});

// Route: User Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email address and password are required.' });
  }

  const emailKey = email.toLowerCase().trim();
  const user = usersStore[emailKey];

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email address or password. Please try again.' });
  }

  console.log(`[AUTH] Logged in operator user: ${emailKey}`);

  return res.json({
    success: true,
    user: {
      email: emailKey,
      name: user.name,
      role: 'Client Operator',
      token: 'session-jwt-' + Date.now()
    },
    message: 'Welcome back! Login successful.'
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

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[SERVER] Express Server running on http://localhost:${PORT}`);
  });
}

export default app;
