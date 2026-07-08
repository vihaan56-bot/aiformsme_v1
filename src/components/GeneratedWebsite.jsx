import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag, Calendar, Check, Send, PhoneCall, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, doc, getDoc, addDoc } from 'firebase/firestore';
import FloatingBotWidget from './FloatingBotWidget';

// Built-in theme definitions mapping theme keys to CSS styles
const THEMES = {
  amber: {
    primary: '35 85% 55%',
    primaryLight: '35 85% 70%',
    secondary: '25 75% 50%',
    bgDark: '28 25% 8%',
    bgCard: '28 20% 12%',
    bgCardHover: '28 20% 16%',
    text: '30 20% 98%',
    textMuted: '30 10% 65%',
    borderColor: '30 15% 18%'
  },
  mint: {
    primary: '150 75% 45%',
    primaryLight: '150 75% 60%',
    secondary: '165 70% 40%',
    bgDark: '160 20% 7%',
    bgCard: '160 15% 11%',
    bgCardHover: '160 15% 15%',
    text: '150 10% 98%',
    textMuted: '150 5% 65%',
    borderColor: '160 10% 16%'
  },
  breeze: {
    primary: '200 85% 50%',
    primaryLight: '200 85% 65%',
    secondary: '215 80% 45%',
    bgDark: '210 25% 8%',
    bgCard: '210 20% 12%',
    bgCardHover: '210 20% 16%',
    text: '200 20% 98%',
    textMuted: '200 10% 65%',
    borderColor: '210 15% 18%'
  },
  cyber: {
    primary: '320 90% 60%',
    primaryLight: '320 90% 75%',
    secondary: '180 100% 50%',
    bgDark: '260 30% 5%',
    bgCard: '260 20% 8%',
    bgCardHover: '260 20% 12%',
    text: '0 0% 98%',
    textMuted: '260 10% 65%',
    borderColor: '260 25% 14%'
  },
  rose: {
    primary: '340 75% 70%',
    primaryLight: '340 75% 85%',
    secondary: '320 60% 60%',
    bgDark: '340 15% 8%',
    bgCard: '340 10% 12%',
    bgCardHover: '340 10% 16%',
    text: '340 10% 98%',
    textMuted: '340 5% 65%',
    borderColor: '340 8% 18%'
  },
  lavender: {
    primary: '270 70% 65%',
    primaryLight: '270 70% 80%',
    secondary: '250 65% 55%',
    bgDark: '250 20% 8%',
    bgCard: '250 15% 12%',
    bgCardHover: '250 15% 16%',
    text: '270 10% 98%',
    textMuted: '270 5% 65%',
    borderColor: '250 12% 18%'
  },
  crimson: {
    primary: '350 85% 55%',
    primaryLight: '350 85% 70%',
    secondary: '335 75% 45%',
    bgDark: '350 20% 8%',
    bgCard: '350 15% 12%',
    bgCardHover: '350 15% 16%',
    text: '350 10% 98%',
    textMuted: '350 5% 65%',
    borderColor: '350 10% 18%'
  },
  midnight: {
    primary: '220 90% 55%',
    primaryLight: '220 90% 70%',
    secondary: '210 80% 45%',
    bgDark: '220 25% 8%',
    bgCard: '220 20% 12%',
    bgCardHover: '220 20% 16%',
    text: '220 20% 98%',
    textMuted: '220 10% 65%',
    borderColor: '220 15% 18%'
  },
  forest: {
    primary: '120 60% 45%',
    primaryLight: '120 60% 60%',
    secondary: '100 50% 40%',
    bgDark: '120 15% 8%',
    bgCard: '120 10% 12%',
    bgCardHover: '120 10% 16%',
    text: '120 10% 98%',
    textMuted: '120 5% 65%',
    borderColor: '120 8% 18%'
  },
  citrus: {
    primary: '45 90% 50%',
    primaryLight: '45 90% 65%',
    secondary: '30 85% 45%',
    bgDark: '40 20% 8%',
    bgCard: '40 15% 12%',
    bgCardHover: '40 15% 16%',
    text: '45 15% 98%',
    textMuted: '45 5% 65%',
    borderColor: '40 12% 18%'
  },
  violet: {
    primary: '285 95% 60%',
    primaryLight: '285 95% 75%',
    secondary: '265 90% 50%',
    bgDark: '275 25% 7%',
    bgCard: '275 20% 11%',
    bgCardHover: '275 20% 15%',
    text: '285 20% 98%',
    textMuted: '285 10% 65%',
    borderColor: '275 15% 17%'
  },
  coffee: {
    primary: '25 50% 50%',
    primaryLight: '25 50% 65%',
    secondary: '15 45% 40%',
    bgDark: '20 20% 8%',
    bgCard: '20 15% 12%',
    bgCardHover: '20 15% 16%',
    text: '25 15% 98%',
    textMuted: '25 5% 65%',
    borderColor: '20 12% 18%'
  },
  aqua: {
    primary: '180 85% 45%',
    primaryLight: '180 85% 60%',
    secondary: '195 80% 40%',
    bgDark: '185 20% 7%',
    bgCard: '185 15% 11%',
    bgCardHover: '185 15% 15%',
    text: '180 15% 98%',
    textMuted: '180 5% 65%',
    borderColor: '185 10% 16%'
  },
  sunset: {
    primary: '345 85% 60%',
    primaryLight: '345 85% 75%',
    secondary: '15 80% 55%',
    bgDark: '350 20% 8%',
    bgCard: '350 15% 12%',
    bgCardHover: '350 15% 16%',
    text: '350 15% 98%',
    textMuted: '350 5% 65%',
    borderColor: '350 10% 18%'
  },
  platinum: {
    primary: '210 10% 60%',
    primaryLight: '210 10% 75%',
    secondary: '210 5% 45%',
    bgDark: '210 12% 9%',
    bgCard: '210 8% 13%',
    bgCardHover: '210 8% 17%',
    text: '210 5% 98%',
    textMuted: '210 3% 65%',
    borderColor: '210 6% 19%'
  },
  solar: {
    primary: '55 95% 50%',
    primaryLight: '55 95% 65%',
    secondary: '45 85% 45%',
    bgDark: '50 15% 6%',
    bgCard: '50 10% 10%',
    bgCardHover: '50 10% 14%',
    text: '55 10% 98%',
    textMuted: '55 5% 65%',
    borderColor: '50 8% 16%'
  },
  lime: {
    primary: '90 90% 50%',
    primaryLight: '90 90% 65%',
    secondary: '75 80% 45%',
    bgDark: '95 15% 6%',
    bgCard: '95 10% 10%',
    bgCardHover: '95 10% 14%',
    text: '90 10% 98%',
    textMuted: '90 5% 65%',
    borderColor: '95 8% 16%'
  },
  plum: {
    primary: '300 65% 50%',
    primaryLight: '300 65% 65%',
    secondary: '285 55% 40%',
    bgDark: '295 15% 8%',
    bgCard: '295 10% 12%',
    bgCardHover: '295 10% 16%',
    text: '300 10% 98%',
    textMuted: '300 5% 65%',
    borderColor: '295 8% 18%'
  },
  royalgold: {
    primary: '45 75% 55%',
    primaryLight: '45 75% 70%',
    secondary: '220 60% 45%',
    bgDark: '220 20% 8%',
    bgCard: '220 15% 12%',
    bgCardHover: '220 15% 16%',
    text: '45 10% 98%',
    textMuted: '220 5% 65%',
    borderColor: '220 12% 18%'
  },
  copper: {
    primary: '20 70% 50%',
    primaryLight: '20 70% 65%',
    secondary: '10 60% 40%',
    bgDark: '15 15% 8%',
    bgCard: '15 10% 12%',
    bgCardHover: '15 10% 16%',
    text: '20 10% 98%',
    textMuted: '20 5% 65%',
    borderColor: '15 8% 18%'
  },
  vampire: {
    primary: '0 85% 50%',
    primaryLight: '0 85% 65%',
    secondary: '350 75% 40%',
    bgDark: '0 10% 5%',
    bgCard: '0 5% 9%',
    bgCardHover: '0 5% 13%',
    text: '0 5% 98%',
    textMuted: '0 3% 65%',
    borderColor: '0 4% 15%'
  },
  orchid: {
    primary: '310 70% 65%',
    primaryLight: '310 70% 80%',
    secondary: '290 60% 55%',
    bgDark: '300 15% 8%',
    bgCard: '300 10% 12%',
    bgCardHover: '300 10% 16%',
    text: '310 10% 98%',
    textMuted: '310 5% 65%',
    borderColor: '300 8% 18%'
  },
  peach: {
    primary: '20 85% 65%',
    primaryLight: '20 85% 80%',
    secondary: '5 70% 55%',
    bgDark: '10 15% 8%',
    bgCard: '10 10% 12%',
    bgCardHover: '10 10% 16%',
    text: '20 10% 98%',
    textMuted: '20 5% 65%',
    borderColor: '10 8% 18%'
  },
  sage: {
    primary: '100 35% 55%',
    primaryLight: '100 35% 70%',
    secondary: '80 30% 45%',
    bgDark: '90 12% 9%',
    bgCard: '90 8% 13%',
    bgCardHover: '90 8% 17%',
    text: '100 10% 98%',
    textMuted: '100 5% 65%',
    borderColor: '90 6% 19%'
  },
  skyblue: {
    primary: '195 90% 55%',
    primaryLight: '195 90% 70%',
    secondary: '185 80% 45%',
    bgDark: '195 20% 8%',
    bgCard: '195 15% 12%',
    bgCardHover: '195 15% 16%',
    text: '195 15% 98%',
    textMuted: '195 5% 65%',
    borderColor: '195 10% 18%'
  },
  charcoal: {
    primary: '0 0% 60%',
    primaryLight: '0 0% 75%',
    secondary: '0 0% 40%',
    bgDark: '0 0% 7%',
    bgCard: '0 0% 11%',
    bgCardHover: '0 0% 15%',
    text: '0 0% 98%',
    textMuted: '0 0% 65%',
    borderColor: '0 0% 16%'
  },
  ice: {
    primary: '210 85% 65%',
    primaryLight: '210 85% 80%',
    secondary: '195 75% 50%',
    bgDark: '205 20% 8%',
    bgCard: '205 15% 12%',
    bgCardHover: '205 15% 16%',
    text: '210 15% 98%',
    textMuted: '210 5% 65%',
    borderColor: '205 10% 18%'
  },
  banana: {
    primary: '50 85% 60%',
    primaryLight: '50 85% 75%',
    secondary: '35 75% 50%',
    bgDark: '40 15% 8%',
    bgCard: '40 10% 12%',
    bgCardHover: '40 10% 16%',
    text: '50 10% 98%',
    textMuted: '50 5% 65%',
    borderColor: '40 8% 18%'
  },
  chocolate: {
    primary: '25 45% 40%',
    primaryLight: '25 45% 55%',
    secondary: '15 40% 35%',
    bgDark: '20 15% 7%',
    bgCard: '20 10% 11%',
    bgCardHover: '20 10% 15%',
    text: '25 10% 98%',
    textMuted: '25 5% 65%',
    borderColor: '20 8% 16%'
  },
  bubblegum: {
    primary: '330 90% 65%',
    primaryLight: '330 90% 80%',
    secondary: '315 80% 55%',
    bgDark: '320 20% 8%',
    bgCard: '320 15% 12%',
    bgCardHover: '320 15% 16%',
    text: '330 15% 98%',
    textMuted: '330 5% 65%',
    borderColor: '320 10% 18%'
  },
  desert: {
    primary: '35 60% 55%',
    primaryLight: '35 60% 70%',
    secondary: '25 50% 45%',
    bgDark: '30 15% 9%',
    bgCard: '30 10% 13%',
    bgCardHover: '30 10% 17%',
    text: '35 10% 98%',
    textMuted: '35 5% 65%',
    borderColor: '30 8% 19%'
  },
  tropical: {
    primary: '170 90% 50%',
    primaryLight: '170 90% 65%',
    secondary: '190 85% 45%',
    bgDark: '180 25% 8%',
    bgCard: '180 20% 12%',
    bgCardHover: '180 20% 16%',
    text: '170 20% 98%',
    textMuted: '170 10% 65%',
    borderColor: '180 15% 18%'
  },
  magma: {
    primary: '15 95% 55%',
    primaryLight: '15 95% 70%',
    secondary: '5 85% 45%',
    bgDark: '10 20% 7%',
    bgCard: '10 15% 11%',
    bgCardHover: '10 15% 15%',
    text: '15 15% 98%',
    textMuted: '15 5% 65%',
    borderColor: '10 10% 16%'
  },
  electricindigo: {
    primary: '240 85% 60%',
    primaryLight: '240 85% 75%',
    secondary: '260 80% 55%',
    bgDark: '250 20% 8%',
    bgCard: '250 15% 12%',
    bgCardHover: '250 15% 16%',
    text: '240 15% 98%',
    textMuted: '240 5% 65%',
    borderColor: '250 10% 18%'
  },
  cyberneon: {
    primary: '300 95% 60%',
    primaryLight: '300 95% 75%',
    secondary: '120 90% 50%',
    bgDark: '280 25% 7%',
    bgCard: '280 20% 11%',
    bgCardHover: '280 20% 15%',
    text: '300 20% 98%',
    textMuted: '300 10% 65%',
    borderColor: '280 15% 17%'
  },
  olive: {
    primary: '80 50% 45%',
    primaryLight: '80 50% 60%',
    secondary: '65 40% 35%',
    bgDark: '75 15% 8%',
    bgCard: '75 10% 12%',
    bgCardHover: '75 10% 16%',
    text: '80 10% 98%',
    textMuted: '80 5% 65%',
    borderColor: '75 8% 18%'
  },
  pistachio: {
    primary: '120 50% 60%',
    primaryLight: '120 50% 75%',
    secondary: '100 40% 50%',
    bgDark: '110 15% 8%',
    bgCard: '110 10% 12%',
    bgCardHover: '110 10% 16%',
    text: '120 10% 98%',
    textMuted: '120 5% 65%',
    borderColor: '110 8% 18%'
  },
  coral: {
    primary: '10 85% 60%',
    primaryLight: '10 85% 75%',
    secondary: '350 75% 50%',
    bgDark: '5 20% 8%',
    bgCard: '5 15% 12%',
    bgCardHover: '5 15% 16%',
    text: '10 15% 98%',
    textMuted: '10 5% 65%',
    borderColor: '5 10% 18%'
  },
  teal: {
    primary: '170 80% 45%',
    primaryLight: '170 80% 60%',
    secondary: '155 70% 40%',
    bgDark: '165 20% 7%',
    bgCard: '165 15% 11%',
    bgCardHover: '165 15% 15%',
    text: '170 15% 98%',
    textMuted: '170 5% 65%',
    borderColor: '165 10% 16%'
  },
  glacier: {
    primary: '205 90% 60%',
    primaryLight: '205 90% 75%',
    secondary: '190 80% 50%',
    bgDark: '200 20% 8%',
    bgCard: '200 15% 12%',
    bgCardHover: '200 15% 16%',
    text: '205 15% 98%',
    textMuted: '205 5% 65%',
    borderColor: '200 10% 18%'
  },
  deeppurple: {
    primary: '260 85% 55%',
    primaryLight: '260 85% 70%',
    secondary: '240 75% 45%',
    bgDark: '250 25% 7%',
    bgCard: '250 20% 11%',
    bgCardHover: '250 20% 15%',
    text: '260 20% 98%',
    textMuted: '260 10% 65%',
    borderColor: '250 15% 17%'
  },
  cherryblossom: {
    primary: '345 80% 70%',
    primaryLight: '345 80% 85%',
    secondary: '330 65% 60%',
    bgDark: '340 15% 8%',
    bgCard: '340 10% 12%',
    bgCardHover: '340 10% 16%',
    text: '345 10% 98%',
    textMuted: '345 5% 65%',
    borderColor: '340 8% 18%'
  },
  autumn: {
    primary: '25 85% 50%',
    primaryLight: '25 85% 65%',
    secondary: '10 75% 40%',
    bgDark: '20 20% 8%',
    bgCard: '20 15% 12%',
    bgCardHover: '20 15% 16%',
    text: '25 15% 98%',
    textMuted: '25 5% 65%',
    borderColor: '20 12% 18%'
  },
  mermaid: {
    primary: '160 85% 45%',
    primaryLight: '160 85% 60%',
    secondary: '260 75% 55%',
    bgDark: '210 25% 8%',
    bgCard: '210 20% 12%',
    bgCardHover: '210 20% 16%',
    text: '160 20% 98%',
    textMuted: '160 10% 65%',
    borderColor: '210 15% 18%'
  },
  bronze: {
    primary: '35 60% 45%',
    primaryLight: '35 60% 60%',
    secondary: '20 50% 35%',
    bgDark: '30 15% 8%',
    bgCard: '30 10% 12%',
    bgCardHover: '30 10% 16%',
    text: '35 10% 98%',
    textMuted: '35 5% 65%',
    borderColor: '30 8% 18%'
  },
  steel: {
    primary: '210 40% 55%',
    primaryLight: '210 40% 70%',
    secondary: '200 30% 45%',
    bgDark: '205 15% 8%',
    bgCard: '205 10% 12%',
    bgCardHover: '205 10% 16%',
    text: '210 10% 98%',
    textMuted: '210 5% 65%',
    borderColor: '205 8% 18%'
  },
  bordeaux: {
    primary: '340 75% 45%',
    primaryLight: '340 75% 60%',
    secondary: '320 65% 35%',
    bgDark: '330 20% 7%',
    bgCard: '330 15% 11%',
    bgCardHover: '330 15% 15%',
    text: '340 15% 98%',
    textMuted: '340 5% 65%',
    borderColor: '330 10% 16%'
  },
  tangerine: {
    primary: '24 95% 55%',
    primaryLight: '24 95% 70%',
    secondary: '10 90% 45%',
    bgDark: '18 20% 7%',
    bgCard: '18 15% 11%',
    bgCardHover: '18 15% 15%',
    text: '24 15% 98%',
    textMuted: '24 5% 65%',
    borderColor: '18 10% 16%'
  },
  mintchoc: {
    primary: '140 70% 50%',
    primaryLight: '140 70% 65%',
    secondary: '25 45% 40%',
    bgDark: '20 15% 8%',
    bgCard: '20 10% 12%',
    bgCardHover: '20 10% 16%',
    text: '140 10% 98%',
    textMuted: '140 5% 65%',
    borderColor: '20 8% 18%'
  },
  zen: {
    primary: '95 40% 50%',
    primaryLight: '95 40% 65%',
    secondary: '35 35% 45%',
    bgDark: '50 12% 8%',
    bgCard: '50 8% 12%',
    bgCardHover: '50 8% 16%',
    text: '95 10% 98%',
    textMuted: '95 5% 65%',
    borderColor: '50 6% 18%'
  }
};

// Seed/Default configuration in case database document is missing
const SEED_SITES = {
  joes_bakery: {
    slug: 'joes_bakery',
    bizName: "Joe's Bakery",
    theme: 'amber',
    template: 'bakery',
    title: 'Artisanal Breads & Delectable Pastries Baked Daily',
    subtitle: 'Welcome to Joe\'s Bakery, where every ingredient is selected with care, and every item is baked with love.',
    about: 'Established in 2016, Joe\'s Bakery has been a cornerstone of the neighborhood. We utilize stone-ground local grains and long fermentation processes to create sourdoughs, croissants, and sweet treats that comfort the soul and delight the palate.',
    products: [
      { name: 'Sourdough Country Loaf', price: '₹150', desc: 'Naturally leavened crusty bread, baked in stone hearth.' },
      { name: 'Almond Croissant', price: '₹120', desc: 'Twice-baked flaky croissant filled with sweet almond frangipane.' },
      { name: 'Custom Birthday Cake', price: '₹1,200+', desc: 'Three layers of sponge, homemade buttercream, customized decorations.' },
      { name: 'Cinnamon Roll', price: '₹90', desc: 'Soft brioche dough rolled with Saigon cinnamon and cream cheese glaze.' }
    ],
    botConfig: {
      bizName: "Joe's Bakery",
      systemPrompt: "You are a friendly assistant for Joe's Bakery. Tell customers about our fresh croissants, breads, and custom wedding cakes. If they want to order or book a consultation, ask for their name, email, and description of what they want.",
      requireEmail: true,
      requirePhone: false,
      selectedModel: 'openrouter/free',
      apiKey: ''
    },
    enableBot: true
  },
  fit_studio: {
    slug: 'fit_studio',
    bizName: 'Apex Fitness Studio',
    theme: 'breeze',
    template: 'fitness',
    title: 'Unleash Your Strength. Achieve Your Apex.',
    subtitle: 'Premium training sessions, state-of-the-art weights, and a supportive community to power your fitness journey.',
    about: 'At Apex Fitness, we believe in building sustainable fitness habits. Our certified personal trainers and high-intensity group classes are designed to push you safely past your boundaries to achieve real, measurable results.',
    products: [
      { name: 'Standard Monthly Pass', price: '₹1,999/mo', desc: 'Unlimited access to gym facilities, locker rooms, and group warmups.' },
      { name: 'Elite Personal Coaching', price: '₹1,500/hr', desc: 'One-on-one tailored program design and weekly nutritional audits.' },
      { name: 'HIIT & Conditioning Class', price: '₹399/class', desc: '45-minute intense cardiovascular circuits led by group instructors.' },
      { name: 'Apex Shaker Bottle & Supplement', price: '₹699', desc: 'Leakproof double-insulated steel bottle with pre-workout mix pack.' }
    ],
    botConfig: {
      bizName: 'Apex Fitness Studio',
      systemPrompt: "You are the AI coach for Apex Fitness Studio. Guide customers on memberships, personal training packages, and class schedules. Ask for their name and phone number to schedule a free fitness evaluation call.",
      requireEmail: false,
      requirePhone: true,
      selectedModel: 'openrouter/free',
      apiKey: ''
    },
    enableBot: true
  }
};

export default function GeneratedWebsite({ slug, onBackToPlatform }) {
  const [siteConfig, setSiteConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', msg: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Razorpay Checkout states
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '' });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const parsePrice = (priceStr) => {
    const cleaned = priceStr.replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 99 : num;
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone) return;

    setPaymentProcessing(true);
    const amount = parsePrice(checkoutProduct.price);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load payment gateway checkout libraries. Check your internet connection.");
      setPaymentProcessing(false);
      return;
    }

    try {
      const ordRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount })
      });
      const orderData = await ordRes.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to initiate payment transaction.");
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SmUWHtuEGpIsUR';

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: siteConfig.bizName,
        description: `Purchase: ${checkoutProduct.name}`,
        order_id: orderData.simulated ? undefined : orderData.order_id,
        handler: async function (response) {
          const verifyRes = await fetch('/api/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: orderData.order_id,
              razorpay_payment_id: response.razorpay_payment_id || 'pay_simulated',
              razorpay_signature: response.razorpay_signature || 'sig_simulated'
            })
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setPaymentSuccess(response.razorpay_payment_id || 'pay_simulated');

            // Push to CRM Lead collection as paid order!
            const paymentLead = {
              name: checkoutForm.name,
              email: checkoutForm.email || 'N/A',
              phone: checkoutForm.phone,
              note: `💰 PAID ORDER: Purchased "${checkoutProduct.name}" for ${checkoutProduct.price}. TxRef: ${response.razorpay_payment_id || 'pay_simulated'}`,
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
              source: `Razorpay Payment /${slug}`,
              ownerEmail: siteConfig?.ownerEmail || 'anonymous'
            };

            if (isFirebaseConfigured && db) {
              try {
                await addDoc(collection(db, 'leads'), paymentLead);
              } catch (err) {
                console.error('[WEBSITE] Failed to write lead to Firestore:', err);
              }
            }

            try {
              const storedLeads = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
              localStorage.setItem('aiformsme_leads', JSON.stringify([paymentLead, ...storedLeads]));
              window.dispatchEvent(new Event('aiformsme_lead_added'));
            } catch (err) {
              console.error(err);
            }

            setCheckoutProduct(null);
            setCheckoutForm({ name: '', email: '', phone: '' });
          } else {
            alert(`Payment signature verification failed: ${verifyData.message}`);
          }
          setPaymentProcessing(false);
        },
        prefill: {
          name: checkoutForm.name,
          email: checkoutForm.email,
          contact: checkoutForm.phone
        },
        theme: {
          color: '#8b5cf6'
        }
      };

      if (orderData.simulated) {
        alert(`[RAZORPAY SIMULATOR] Simulated order initiated for ₹${amount}. Redirecting to instant sandbox mock verification...`);
        setTimeout(() => {
          options.handler({
            razorpay_payment_id: `pay_sim_${Math.random().toString(36).substring(7)}`,
            razorpay_signature: `sig_sim_${Math.random().toString(36).substring(7)}`
          });
        }, 1000);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (err) {
      console.error('[RAZORPAY CHECKOUT ERROR]:', err);
      alert(`Checkout transaction failed: ${err.message || err}`);
      setPaymentProcessing(false);
    }
  };

  useEffect(() => {
    async function loadSite() {
      setLoading(true);
      setError(null);

      // 1. Try Firebase Firestore
      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, 'websites', slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSiteConfig(docSnap.data());
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('[WEBSITE] Failed to read from Firebase:', err);
        }
      }

      // 2. Try LocalStorage
      try {
        const storedSites = JSON.parse(localStorage.getItem('aiformsme_websites') || '{}');
        if (storedSites[slug]) {
          setSiteConfig(storedSites[slug]);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('[WEBSITE] Failed to read from LocalStorage:', err);
      }

      // 3. Try Seed data
      if (SEED_SITES[slug]) {
        setSiteConfig(SEED_SITES[slug]);
      } else {
        setError(`Website /${slug} not found. You can create it in the Bot Sandbox!`);
      }
      setLoading(false);
    }

    loadSite();
  }, [slug]);

  // Set page title dynamically
  useEffect(() => {
    if (siteConfig) {
      document.title = `${siteConfig.bizName} - Powered by AIForMSME`;
    }
    return () => {
      document.title = 'AIForMSME Studio - Automation Platform';
    };
  }, [siteConfig]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', background: '#0a0f1d', color: '#fff' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#8b5cf6', animation: 'spin 1s infinite linear' }} />
        <span>Loading Custom Website Sandbox...</span>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  if (error || !siteConfig) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px', background: '#0a0f1d', color: '#fff', padding: '24px', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: '#ef4444' }} />
        <h2 style={{ fontSize: '1.8rem' }}>Website Sandbox Not Found</h2>
        <p style={{ color: '#94a3b8', maxWidth: '400px' }}>{error || 'The requested URL slug has not been generated yet.'}</p>
        <button
          onClick={onBackToPlatform}
          style={{ background: '#8b5cf6', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
        >
          <ArrowLeft size={16} /> Return to AIForMSME Platform
        </button>
      </div>
    );
  }

  // Load theme colors
  const themeVars = THEMES[siteConfig.theme] || THEMES.amber;

  // Apply variables to style container dynamically
  const siteStyle = {
    '--theme-primary': `hsl(${themeVars.primary})`,
    '--theme-primary-light': `hsl(${themeVars.primaryLight})`,
    '--theme-secondary': `hsl(${themeVars.secondary})`,
    '--theme-bg-dark': `hsl(${themeVars.bgDark})`,
    '--theme-bg-card': `hsl(${themeVars.bgCard})`,
    '--theme-bg-card-hover': `hsl(${themeVars.bgCardHover})`,
    '--theme-text': `hsl(${themeVars.text})`,
    '--theme-text-muted': `hsl(${themeVars.textMuted})`,
    '--theme-border': `hsl(${themeVars.borderColor})`,

    backgroundColor: 'var(--theme-bg-dark)',
    color: 'var(--theme-text)',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    const newLead = {
      name: formData.name,
      email: formData.email || 'N/A',
      phone: formData.phone || 'N/A',
      note: formData.msg || `Contact Form submission on /${slug}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      source: `Website /${slug}`,
      ownerEmail: siteConfig?.ownerEmail || 'anonymous'
    };

    // PUSH LEAD TO FIREBASE
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'leads'), newLead);
      } catch (err) {
        console.error('[WEBSITE] Failed to write lead to Firestore:', err);
      }
    }

    // Always log locally to sync frontend count just in case
    try {
      const storedLeads = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
      localStorage.setItem('aiformsme_leads', JSON.stringify([newLead, ...storedLeads]));

      // Dispatch custom event to let App.jsx know count has updated
      window.dispatchEvent(new Event('aiformsme_lead_added'));
    } catch (err) {
      console.error(err);
    }

    setSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', phone: '', msg: '' });

    setTimeout(() => {
      setSubmitSuccess(false);
    }, 5000);
  };

  return (
    <div style={siteStyle}>


      {/* Website Navigation Header */}
      <header style={{
        padding: '20px 8%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--theme-border)',
        background: 'rgba(var(--theme-bg-dark), 0.5)',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'white' }}>
          <Sparkles style={{ color: 'var(--theme-primary)' }} size={20} />
          <span>{siteConfig.bizName}</span>
        </div>
        <nav style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', fontWeight: '500' }}>
          <a href="#home" style={{ color: 'white' }}>Home</a>
          <a href="#about" style={{ color: 'var(--theme-text-muted)' }}>About Us</a>
          <a href="#services" style={{ color: 'var(--theme-text-muted)' }}>{siteConfig.template === 'bakery' ? 'Menu' : 'Services'}</a>
          <a href="#contact" style={{ color: 'var(--theme-text-muted)' }}>Contact</a>
        </nav>
        <div>
          <a href="#contact" style={{
            background: 'var(--theme-primary)',
            color: 'white',
            padding: '8px 18px',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.85rem'
          }}>
            Get Quote
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" style={{
        padding: '100px 8% 80px 8%',
        background: 'radial-gradient(circle at 70% 30%, var(--theme-primary-light) / 0.05, transparent 50%)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--theme-primary) / 0.1', border: '1px solid var(--theme-primary) / 0.25', color: 'var(--theme-primary)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ✨ Now Open & Ready to Serve
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.15', maxWidth: '800px', color: 'white', letterSpacing: '-0.03em' }}>
          {siteConfig.title}
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--theme-text-muted)', maxWidth: '650px', lineHeight: '1.6' }}>
          {siteConfig.subtitle}
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          <a href="#contact" style={{
            background: 'var(--theme-primary)',
            color: 'white',
            padding: '12px 30px',
            borderRadius: '8px',
            fontWeight: '700',
            boxShadow: '0 4px 12px var(--theme-primary) / 0.25'
          }}>
            Contact Us
          </a>
          <a href="#services" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--theme-border)',
            color: 'white',
            padding: '12px 30px',
            borderRadius: '8px',
            fontWeight: '600'
          }}>
            Browse Catalog
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{
        padding: '80px 8%',
        borderTop: '1px solid var(--theme-border)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div className="generated-site-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--theme-primary)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Our Story</div>
            <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '16px' }}>Who We Are & What We Value</h2>
            <p style={{ color: 'var(--theme-text-muted)', lineHeight: '1.7', fontSize: '0.95rem' }}>
              {siteConfig.about}
            </p>
            <div className="generated-site-grid-half" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Check style={{ color: 'var(--theme-primary)', flexShrink: 0, marginTop: '2px' }} size={16} />
                <div>
                  <h4 style={{ color: 'white', fontSize: '0.9rem' }}>Locally Sourced</h4>
                  <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.8rem' }}>100% natural and community products.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Check style={{ color: 'var(--theme-primary)', flexShrink: 0, marginTop: '2px' }} size={16} />
                <div>
                  <h4 style={{ color: 'white', fontSize: '0.9rem' }}>Expertly Prepared</h4>
                  <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.8rem' }}>Handcrafted by passionate artisans.</p>
                </div>
              </div>
            </div>
          </div>
          <div style={{
            background: 'var(--theme-bg-card)',
            border: '1px solid var(--theme-border)',
            borderRadius: '16px',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'var(--theme-primary)', opacity: '0.08', filter: 'blur(30px)' }} />
            <h3 style={{ color: 'white', fontSize: '1.25rem' }}>Operating Hours</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--theme-text-muted)' }}>Monday - Friday</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>7:00 AM - 6:00 PM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--theme-text-muted)' }}>Saturday</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>8:00 AM - 4:00 PM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--theme-text-muted)' }}>Sunday</span>
                <span style={{ color: 'var(--theme-primary)' }}>Closed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services/Menu Catalog Section */}
      <section id="services" style={{
        padding: '80px 8%',
        borderTop: '1px solid var(--theme-border)',
        textAlign: 'center'
      }}>
        <div style={{ color: 'var(--theme-primary)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Our Offerings</div>
        <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '40px' }}>
          {siteConfig.template === 'bakery' ? 'Freshly Baked Menu' : 'Premium Services List'}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {siteConfig.products?.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--theme-bg-card)',
                border: '1px solid var(--theme-border)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: '700' }}>{item.name}</h4>
                <span style={{ color: 'var(--theme-primary-light)', fontWeight: 'bold', fontSize: '1rem', background: 'var(--theme-primary) / 0.1', padding: '2px 8px', borderRadius: '4px' }}>
                  {item.price}
                </span>
              </div>
              <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.85rem', lineHeight: '1.5', flex: 1 }}>
                {item.desc}
              </p>
              <button
                onClick={() => setCheckoutProduct(item)}
                style={{
                  marginTop: '12px',
                  padding: '10px 16px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'white',
                  background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <ShoppingBag size={14} /> Buy & Book Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{
        padding: '80px 8%',
        borderTop: '1px solid var(--theme-border)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div className="generated-site-grid" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '50px' }}>
          <div>
            <div style={{ color: 'var(--theme-primary)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Get In Touch</div>
            <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '16px' }}>Ready to Get Started?</h2>
            <p style={{ color: 'var(--theme-text-muted)', lineHeight: '1.6', fontSize: '0.9rem', marginBottom: '30px' }}>
              Fill out the form to request a custom order, pricing inquiry, or detailed consultation. Our team responds within 24 hours.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--theme-primary) / 0.1', display: 'flex', alignItems: 'center', justify_content: 'center', color: 'var(--theme-primary)' }}>
                  <PhoneCall size={16} />
                </div>
                <div>
                  <h4 style={{ color: 'white', fontSize: '0.85rem', margin: 0 }}>Call Center Support</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)' }}>+1 (555) 482-9012</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--theme-bg-card)',
            border: '1px solid var(--theme-border)',
            borderRadius: '16px',
            padding: '30px'
          }}>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="generated-site-grid-half" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', fontWeight: 'bold' }}>Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--theme-border)',
                      borderRadius: '8px',
                      padding: '10px',
                      color: 'white',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', fontWeight: 'bold' }}>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--theme-border)',
                      borderRadius: '8px',
                      padding: '10px',
                      color: 'white',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', fontWeight: 'bold' }}>Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--theme-border)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: 'white',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', fontWeight: 'bold' }}>Inquiry Message</label>
                <textarea
                  rows={4}
                  value={formData.msg}
                  onChange={(e) => setFormData({ ...formData, msg: e.target.value })}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--theme-border)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: 'white',
                    fontSize: '0.85rem',
                    resize: 'none'
                  }}
                />
              </div>

              {submitSuccess && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  color: '#4ade80',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✓ Inquiry successfully submitted! Our team will reach you shortly.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: 'var(--theme-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Send size={16} /> {submitting ? 'Submitting...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '40px 8%',
        background: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid var(--theme-border)',
        fontSize: '0.85rem',
        color: 'var(--theme-text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>© 2026 {siteConfig.bizName}. All rights reserved. Powered by AIForMSME.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
        </div>
      </footer>

      {/* Render Dynamic Custom Floating Chatbot Assistant */}
      {siteConfig.enableBot && (
        <FloatingBotWidget
          bizName={siteConfig.bizName}
          botConfig={siteConfig.botConfig}
          themeColors={themeVars}
          ownerEmail={siteConfig?.ownerEmail || 'anonymous'}
        />
      )}

      {/* Razorpay Checkout User Information Modal */}
      {checkoutProduct && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(5, 8, 20, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 3000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '480px',
            padding: '30px', borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--theme-bg-card) 0%, rgba(139, 92, 246, 0.03) 100%)',
            border: '1px solid var(--theme-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={() => setCheckoutProduct(null)}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'none', border: 'none', color: 'var(--theme-text-muted)',
                fontSize: '1.2rem', cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--theme-primary) / 0.1', color: 'var(--theme-primary-light)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <ShoppingBag size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'white', fontWeight: 'bold' }}>Complete Your Booking</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)', marginTop: '4px' }}>
                You are purchasing: <strong>{checkoutProduct.name}</strong> for <strong style={{ color: 'var(--theme-primary-light)' }}>{checkoutProduct.price}</strong>
              </p>
            </div>

            <form onSubmit={handleInitiatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', fontWeight: 'bold' }}>Full Name *</label>
                <input
                  type="text" required
                  value={checkoutForm.name}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--theme-border)',
                    borderRadius: '8px', padding: '12px', color: 'white', fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', fontWeight: 'bold' }}>Email Address</label>
                <input
                  type="email"
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--theme-border)',
                    borderRadius: '8px', padding: '12px', color: 'white', fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', fontWeight: 'bold' }}>Phone Number *</label>
                <input
                  type="tel" required
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--theme-border)',
                    borderRadius: '8px', padding: '12px', color: 'white', fontSize: '0.85rem'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={paymentProcessing}
                style={{
                  background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%)',
                  border: 'none', color: 'white', fontWeight: 'bold', fontSize: '0.9rem',
                  padding: '14px', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '10px', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)'
                }}
              >
                {paymentProcessing ? (
                  <>Processing Gateway...</>
                ) : (
                  <>
                    <Check size={16} /> Pay {checkoutProduct.price} via Razorpay
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {paymentSuccess && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white', padding: '16px 24px', borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          display: 'flex', alignItems: 'center', gap: '12px', zIndex: 4000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            ✓
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>Payment Successful!</h4>
            <p style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>TxRef: {paymentSuccess}</p>
          </div>
          <button
            onClick={() => setPaymentSuccess(null)}
            style={{
              background: 'none', border: 'none', color: 'white',
              fontSize: '1rem', cursor: 'pointer', marginLeft: '10px'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
