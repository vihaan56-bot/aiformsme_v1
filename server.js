import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import fs from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK for JWT verification
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    // Replace double-quoted escaped newlines with actual newlines
    const privateKey = rawPrivateKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1');
    
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      })
    });
    console.log('[FIREBASE ADMIN] Initialized Firebase Admin SDK successfully!');
  } catch (err) {
    console.error('[FIREBASE ADMIN ERROR] Failed to initialize Admin SDK:', err);
  }
} else {
  console.warn('[FIREBASE ADMIN] Missing credentials in .env. SDK auth verification will default to fallback mode.');
}

// Middleware: Authenticate and decode Firebase ID Token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token is required.' });
  }

  // Fallback for mock/local dashboard sessions without active network config
  if (token.startsWith('session-local-') || token.startsWith('session-jwt-')) {
    req.user = { uid: 'mock_uid_' + token.split('-').pop() };
    return next();
  }

  try {
    if (getApps().length > 0) {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = { uid: decodedToken.uid };
      return next();
    } else {
      // Local fallback in development when SDK not active
      req.user = { uid: 'sandbox_default_uid' };
      return next();
    }
  } catch (error) {
    console.error('[AUTH ERROR] Token verification failed:', error.message);
    return res.status(403).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

// Lightweight In-Memory Rate Limiting Middleware
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 30;

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  
  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, []);
  }
  
  const timestamps = ipRequestCounts.get(ip).filter(ts => now - ts < RATE_LIMIT_WINDOW);
  timestamps.push(now);
  ipRequestCounts.set(ip, timestamps);
  
  if (timestamps.length > MAX_REQUESTS_PER_MINUTE) {
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again in a minute.' });
  }
  
  next();
};

// Helper: Secure API Call to OpenRouter
const generateAIText = async (systemPrompt, userPrompt, maxTokens = 400) => {
  const apiKey = process.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('AI API Key is missing on the server.');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aiformsme.co.in',
        'X-Title': 'AIForMSME Command Center'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API failed: ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error('[AI SERVICE ERROR] Failed to fetch completion:', err);
    throw err;
  }
};

// Route: Strict Task-Based AI Generation
app.post('/api/ai/generate', authenticateToken, rateLimiter, async (req, res) => {
  const { taskType, businessId, input } = req.body;

  if (!taskType || !businessId || !input) {
    return res.status(400).json({ success: false, message: 'Missing required parameters: taskType, businessId, input.' });
  }

  const allowedTasks = ['REVIEW_REPLY', 'FOLLOW_UP', 'SOCIAL_CONTENT', 'BUSINESS_INSIGHT', 'PAYMENT_REMINDER'];
  if (!allowedTasks.includes(taskType)) {
    return res.status(400).json({ success: false, message: 'Unsupported taskType.' });
  }

  // Schema Validation
  if (taskType === 'REVIEW_REPLY') {
    if (input.rating === undefined || !input.review) {
      return res.status(400).json({ success: false, message: 'Missing rating or review for REVIEW_REPLY.' });
    }
  } else if (taskType === 'FOLLOW_UP') {
    if (!input.customerName || !input.reason) {
      return res.status(400).json({ success: false, message: 'Missing customerName or reason for FOLLOW_UP.' });
    }
  } else if (taskType === 'SOCIAL_CONTENT') {
    if (!input.offer || !input.product) {
      return res.status(400).json({ success: false, message: 'Missing offer or product for SOCIAL_CONTENT.' });
    }
  } else if (taskType === 'PAYMENT_REMINDER') {
    if (!input.customerName || !input.invoiceNumber || !input.amount || !input.dueDate) {
      return res.status(400).json({ success: false, message: 'Missing customerName, invoiceNumber, amount, or dueDate for PAYMENT_REMINDER.' });
    }
  }

  try {
    let systemPrompt = '';
    let userPrompt = '';
    let maxTokens = 400;

    if (taskType === 'REVIEW_REPLY') {
      systemPrompt = "You are a polite, professional, and empathetic reputation manager for a small business. Draft a response to a customer review. Keep it under 3-4 sentences. Do not mention any placeholder names or codes.";
      userPrompt = `Customer Name: ${input.customerName || 'Customer'}\nRating: ${input.rating} stars out of 5\nReview: "${input.review}"\nTone: ${input.tone || 'Friendly'}\nDraft the response directly, without introductions or quotation marks.`;
    } else if (taskType === 'FOLLOW_UP') {
      systemPrompt = "You are a friendly customer success assistant. Draft a direct, personalized follow-up message for a lead. The message must be extremely short (under 2 sentences), warm, and include natural emojis. Focus on booking a callback or completing their interest. Do not include subject lines or formal headers.";
      userPrompt = `Customer Name: ${input.customerName}\nReason for follow-up: ${input.reason}\nWrite the message text directly.`;
    } else if (taskType === 'SOCIAL_CONTENT') {
      systemPrompt = "You are a social media copywriter for small businesses. Generate promotional content based on an offer. You must output a JSON object containing four keys: 'instagram' (include brief text and 3-5 relevant hashtags), 'whatsapp' (conversational with emojis), 'facebook' (engaging description), and 'poster' (a short header and subtitle). Output ONLY valid raw JSON, no markdown formatting blocks, no ticks.";
      userPrompt = `Business Name: ${input.businessName || 'Our Business'}\nOffer: ${input.offer}\nProduct/Service: ${input.product}\nDiscount: ${input.discount || 'None'}\nTarget Audience: ${input.targetAudience || 'General'}\nTone: ${input.tone || 'Excited'}`;
      maxTokens = 600;
    } else if (taskType === 'BUSINESS_INSIGHT') {
      systemPrompt = "You are a business consultant analyzing operations data for a small shop/service. Based on the provided summary of recent customer interactions, give ONE actionable recommendation/insight for the business owner. The response must be a single, short sentence under 25 words (e.g., 'Demand for birthday cakes is high this week; consider offering a custom cake discount to capture leads').";
      userPrompt = `Operational Data Summary:\n- Leads Captured: ${input.leadsCount || 0}\n- Active Conversations: ${input.conversationsCount || 0}\n- Bookings/Appointments: ${input.bookingsCount || 0}\n- Top customer interests and inquiries: ${input.interestsText || 'General inquiries'}\nProvide the insight text directly.`;
    } else if (taskType === 'PAYMENT_REMINDER') {
      systemPrompt = "You are a polite collections assistant. Draft a gentle, professional payment reminder for an invoice. The message must be under 3 sentences, extremely polite, and suitable for sending via WhatsApp or SMS. Do not use placeholders or brackets.";
      userPrompt = `Customer Name: ${input.customerName}\nInvoice Number: ${input.invoiceNumber}\nAmount: ${input.amount}\nDue Date: ${input.dueDate}\nWrite the reminder message directly.`;
    }

    const aiText = await generateAIText(systemPrompt, userPrompt, maxTokens);

    if (taskType === 'SOCIAL_CONTENT') {
      try {
        let cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return res.json({ success: true, text: aiText, parsed });
      } catch (jsonErr) {
        console.warn('Failed to parse model JSON directly, returning text:', jsonErr);
        const fallbackParsed = {
          instagram: aiText,
          whatsapp: aiText,
          facebook: aiText,
          poster: "Special Promotion / Offer Available Now!"
        };
        return res.json({ success: true, text: aiText, parsed: fallbackParsed });
      }
    }

    return res.json({ success: true, text: aiText });

  } catch (error) {
    console.error(`[AI ERROR ${taskType}]:`, error);
    return res.status(500).json({ success: false, message: "We couldn't generate the reply right now. Please try again." });
  }
});

// Load persistent users store from users.json file (so restarts don't erase accounts)
let usersStore = {};
const USERS_FILE_PATH = path.join(process.cwd(), 'users.json');

try {
  if (fs.existsSync(USERS_FILE_PATH)) {
    const fileData = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    usersStore = JSON.parse(fileData || '{}');
    console.log('[AUTH] Loaded registered operator users database from users.json');
  }
} catch (err) {
  console.error('[AUTH ERROR] Failed to load users.json database:', err);
}

const saveUsersToFile = () => {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(usersStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[AUTH ERROR] Failed to save users to users.json database:', err);
  }
};

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

  usersStore[emailKey] = {
    name: name.trim(),
    email: emailKey,
    password: password
  };
  saveUsersToFile();

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
const getRazorpayInstance = (customKeyId, customKeySecret) => {
  const keyId = customKeyId || process.env.RAZORPAY_KEY_ID;
  const keySecret = customKeySecret || process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.log('[RAZORPAY] Credentials missing. Running in Sandbox Simulation mode.');
    return null;
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

// Route: Create Razorpay Order
app.post('/api/payment/create-order', async (req, res) => {
  const { amount, currency = 'INR', receipt = 'receipt_1', razorpayKeyId, razorpayKeySecret } = req.body;
  if (!amount) {
    return res.status(400).json({ success: false, message: 'Amount is required.' });
  }

  const razorpayInstance = getRazorpayInstance(razorpayKeyId, razorpayKeySecret);
  if (!razorpayInstance) {
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
      amount: Math.round(amount * 100),
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
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpayKeySecret } = req.body;
  const keySecret = razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

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
