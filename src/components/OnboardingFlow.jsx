import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Check, ArrowRight, Bot, MessageSquare, Users, Calendar, Megaphone, BadgeDollarSign, ShieldAlert } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export default function OnboardingFlow({ currentUser, onComplete }) {
  const [step, setStep] = useState(1);
  const [bizType, setBizType] = useState('');
  const [responsibilities, setResponsibilities] = useState([]);
  const [bizName, setBizName] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizLocation, setBizLocation] = useState('');
  const [setupLogs, setSetupLogs] = useState([]);
  const [animating, setAnimating] = useState(false);

  const businessTypes = [
    { id: 'bakery', label: 'Bakery / Cake Shop', icon: '🍞' },
    { id: 'salon', label: 'Salon & Spa', icon: '💇' },
    { id: 'clinic', label: 'Dental / Medical Clinic', icon: '🦷' },
    { id: 'restaurant', label: 'Restaurant / Cafe', icon: '🍳' },
    { id: 'shop', label: 'Retail Kirana / Shop', icon: '🛒' },
    { id: 'services', label: 'Professional Services', icon: '💼' },
    { id: 'other', label: 'Other Business', icon: '✨' }
  ];

  const responsibilityOptions = [
    { id: 'answer_customers', label: 'Answer Customer Questions', desc: 'Auto-respond to product catalog, hours, and location questions.', icon: <MessageSquare size={18} /> },
    { id: 'capture_leads', label: 'Capture & Score Leads', desc: 'Collect contact details and identify high-value inquiries.', icon: <Users size={18} /> },
    { id: 'book_appointments', label: 'Book Appointments', desc: 'Arrange slots and manage customer callback logs.', icon: <Calendar size={18} /> },
    { id: 'follow_ups', label: 'Follow Up Customers', desc: 'Draft friendly follow-ups for warm leads who went quiet.', icon: <Sparkles size={18} /> },
    { id: 'social_content', label: 'Create Social Posts', desc: 'Generate Instagram captions, WhatsApp messages, and marketing headlines.', icon: <Megaphone size={18} /> },
    { id: 'payment_reminders', label: 'Track Payments & Reminders', desc: 'Log customer invoices and generate polite payment reminders.', icon: <BadgeDollarSign size={18} /> }
  ];

  const handleNext = () => {
    if (step === 1 && !bizType) return;
    if (step === 2 && responsibilities.length === 0) return;
    if (step === 3 && !bizName.trim()) return;

    if (step === 3) {
      triggerSetupSimulation();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const toggleResponsibility = (id) => {
    setResponsibilities(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const triggerSetupSimulation = async () => {
    setStep(4);
    setAnimating(true);

    const logs = [
      'Understanding your business model...',
      'Configuring customer assistant tone...',
      'Setting up lead scoring modules...',
      'Preparing social studio marketing templates...',
      'Your AI Employee is fully operational!'
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSetupLogs(prev => [...prev, logs[i]]);
    }

    setAnimating(false);
  };

  const getDefaultSiteTemplate = (type, name, phone) => {
    const templates = {
      bakery: {
        template: 'bakery',
        theme: 'amber',
        title: 'Artisanal Breads & Delectable Pastries Baked Daily',
        subtitle: `Welcome to ${name}, where every item is baked with love and fresh ingredients.`,
        about: `${name} specializes in sourdoughs, croissants, custom cakes, and sweet treats baked from scratch using organic stone-ground grains.`,
        products: [
          { name: 'Sourdough Country Loaf', price: '₹150', desc: 'Naturally leavened crusty bread, baked in stone hearth.' },
          { name: 'Almond Croissant', price: '₹120', desc: 'Twice-baked flaky croissant filled with sweet almond frangipane.' }
        ]
      },
      salon: {
        template: 'salon',
        theme: 'rose',
        title: 'Relax. Rejuvenate. Rediscover Your Glow.',
        subtitle: `Premium beauty treatments and organic skincare at ${name}.`,
        about: 'Our boutique spa offers a peaceful escape from daily life. We use premium botanicals and advanced styling techniques to restore your natural balance.',
        products: [
          { name: 'Signature Organic Facial', price: '₹1,999', desc: 'Deep cleansing treatment using customized botanical extracts.' },
          { name: 'Aromatherapy Swedish Massage', price: '₹2,500/hr', desc: 'Full-body relaxation therapy with essential oils.' }
        ]
      },
      clinic: {
        template: 'dental',
        theme: 'aqua',
        title: 'Gentle Care for Healthy, Radiant Smiles',
        subtitle: `State-of-the-art clinic care at ${name} in a comforting environment.`,
        about: 'We provide personalized medical and wellness care. Our experienced staff utilizes modern tools and digital scans to maintain your long-term health.',
        products: [
          { name: 'Routine Health Checkup', price: '₹999', desc: 'Complete consultation, blood pressure monitoring, and health advice.' },
          { name: 'Wellness Consultation', price: 'Free', desc: '1-on-1 lifestyle analysis and nutrition audit.' }
        ]
      },
      restaurant: {
        template: 'bakery',
        theme: 'amber',
        title: 'Delicious Hot Meals & Refreshing Beverages',
        subtitle: `Experience fine culinary dining at ${name}.`,
        about: 'We combine local ingredients and seasonal spices to prepare comforting recipes and premium coffees.',
        products: [
          { name: 'Chef Special Pasta', price: '₹349', desc: 'Fresh handmade pasta in garlic cream cheese sauce.' },
          { name: 'Brewed Espresso Coffee', price: '₹140', desc: 'Single-origin roasted beans extracted perfectly.' }
        ]
      },
      shop: {
        template: 'services',
        theme: 'breeze',
        title: 'Premium Quality Daily Goods & Groceries',
        subtitle: `Your neighborhood retail shop: ${name}.`,
        about: 'Providing fresh vegetables, domestic utilities, packaged groceries, and home delivery services at affordable prices.',
        products: [
          { name: 'Premium Rice (5kg)', price: '₹350', desc: 'Double-polished Basmati grain.' },
          { name: 'Organic Cold-Pressed Oil', price: '₹220', desc: '1 Litre pure mustard extract.' }
        ]
      },
      services: {
        template: 'services',
        theme: 'breeze',
        title: 'Scale Your Operations. Dominate Your Market.',
        subtitle: `Tailored business development and coaching solutions from ${name}.`,
        about: 'We help small and medium enterprises optimize their workflows and integrate cutting-edge systems to increase productivity.',
        products: [
          { name: 'Operational Bottleneck Audit', price: '₹9,999', desc: 'Comprehensive review of your systems with a detailed roadmap.' },
          { name: 'Custom AI Setup Consult', price: 'Free', desc: '1-on-1 workflow analysis and automation design.' }
        ]
      },
      other: {
        template: 'services',
        theme: 'breeze',
        title: 'Empowering Your Everyday Life',
        subtitle: `Customized local solutions tailored for you by ${name}.`,
        about: 'We are committed to delivering top-tier services, upfront pricing, and absolute reliability for our customers.',
        products: [
          { name: 'Standard Service Package', price: '₹2,500', desc: 'All-inclusive startup optimization service.' }
        ]
      }
    };

    return templates[type] || templates['other'];
  };

  const handleFinish = async () => {
    const businessData = {
      ownerId: currentUser?.uid || currentUser?.email || 'anonymous',
      businessName: bizName.trim(),
      businessType: bizType,
      aiResponsibilities: responsibilities,
      bizPhone: bizPhone.trim() || 'N/A',
      bizLocation: bizLocation.trim() || 'N/A',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Assign a stable local fallback ID in case Firestore is offline or local credentials are used
    const userSeed = currentUser?.uid || currentUser?.email || 'anonymous';
    businessData.id = 'biz_' + userSeed.replace(/[^a-z0-9]/gi, '');

    // Save business profile
    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'businesses'), businessData);
        businessData.id = docRef.id;
      } catch (err) {
        console.error('[ONBOARDING] Failed to save business to Firestore:', err);
      }
    }

    // Auto-create default website config so the dashboard launches with a live site
    const siteSlug = bizName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').replace(/_+/g, '_');
    const defaultTemplate = getDefaultSiteTemplate(bizType, bizName.trim(), bizPhone.trim());

    const defaultSiteData = {
      slug: siteSlug,
      bizName: bizName.trim(),
      theme: defaultTemplate.theme,
      template: defaultTemplate.template,
      title: defaultTemplate.title,
      subtitle: defaultTemplate.subtitle,
      about: defaultTemplate.about,
      products: defaultTemplate.products,
      bizPhone: bizPhone.trim() || 'N/A',
      bizHours: 'Monday - Saturday: 9:00 AM - 7:00 PM\nSunday: Closed',
      enablePayments: false,
      botConfig: {
        bizName: bizName.trim(),
        systemPrompt: `You are a helpful AI assistant for ${bizName.trim()}. Help customers answer questions about our services and contact details. Prompt them for their name, email, or phone number to book an appointment or inquire about pricing.`,
        requireEmail: true,
        requirePhone: false,
        selectedModel: 'openrouter/free',
        apiKey: '',
        agentTone: 'friendly'
      },
      enableBot: true,
      ownerEmail: currentUser?.email || 'anonymous',
      ownerId: currentUser?.uid || 'anonymous',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save default site to Firestore websites/{slug}
    if (db) {
      try {
        await setDoc(doc(db, 'websites', siteSlug), defaultSiteData);
        console.log('[ONBOARDING] Automatically created default template website for:', siteSlug);
      } catch (err) {
        console.error('[ONBOARDING] Auto website creation doc failed:', err);
      }
    }

    // Save configurations locally
    try {
      localStorage.setItem('aiformsme_business_config', JSON.stringify(businessData));
      const storedSites = JSON.parse(localStorage.getItem('aiformsme_websites') || '{}');
      storedSites[siteSlug] = defaultSiteData;
      localStorage.setItem('aiformsme_websites', JSON.stringify(storedSites));
    } catch (e) {}

    onComplete(businessData);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
      <div className="glass-panel" style={{ padding: '40px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        
        {/* Progress Tracker */}
        {step < 4 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: step >= s ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.05)',
                  boxShadow: step >= s ? '0 0 8px hsl(var(--primary))' : 'none',
                  transition: 'background-color 0.3s'
                }} 
              />
            ))}
          </div>
        )}

        {/* Step 1: Business Type */}
        {step === 1 && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>What type of business do you run?</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Select a category to pre-load optimal prompts and templates.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {businessTypes.map(b => (
                <button
                  key={b.id}
                  onClick={() => setBizType(b.id)}
                  style={{
                    padding: '20px',
                    textAlign: 'left',
                    background: bizType === b.id ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${bizType === b.id ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{b.icon}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{b.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!bizType}
              className="btn-primary"
              style={{ alignSelf: 'flex-end', opacity: !bizType ? 0.5 : 1, marginTop: '12px' }}
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Responsibilities */}
        {step === 2 && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>Select AI Employee Responsibilities</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Select tasks you want your AI Employee to help manage.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {responsibilityOptions.map(r => {
                const selected = responsibilities.includes(r.id);
                return (
                  <div
                    key={r.id}
                    onClick={() => toggleResponsibility(r.id)}
                    style={{
                      padding: '16px',
                      background: selected ? 'rgba(6, 182, 212, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${selected ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: selected ? 'hsl(var(--primary) / 0.15)' : 'rgba(255,255,255,0.03)',
                      color: selected ? 'hsl(var(--primary-light))' : 'hsl(var(--text-muted))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {r.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white', margin: 0 }}>{r.label}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', margin: '2px 0 0 0' }}>{r.desc}</p>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: '1.5px solid rgba(255,255,255,0.15)',
                      backgroundColor: selected ? 'hsl(var(--primary))' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      {selected && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button
                onClick={handleNext}
                disabled={responsibilities.length === 0}
                className="btn-primary"
                style={{ opacity: responsibilities.length === 0 ? 0.5 : 1 }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Business details */}
        {step === 3 && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>Business Workspace Details</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Enter standard profile details for your digital business card.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Business Name *</label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="e.g. Joe's Sweet Treats"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Contact Phone Number</label>
                <input
                  type="tel"
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Store Address / Location</label>
                <input
                  type="text"
                  value={bizLocation}
                  onChange={(e) => setBizLocation(e.target.value)}
                  placeholder="e.g. MG Road, Bengaluru"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button
                onClick={handleNext}
                disabled={!bizName.trim()}
                className="btn-primary"
                style={{ opacity: !bizName.trim() ? 0.5 : 1 }}
              >
                Assemble AI Employee <Bot size={16} style={{ marginLeft: '4px' }} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Loading & Finish */}
        {step === 4 && (
          <div className="animate-slide-up" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            <div style={{ position: 'relative' }}>
              <div 
                className={animating ? "animate-pulse-glow" : ""}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 0 20px rgba(6,182,212,0.3)'
                }}
              >
                <Bot size={36} />
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>
                {animating ? 'Configuring Your AI Employee...' : '🎉 Your AI Employee is Ready!'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', maxWidth: '340px', margin: '0 auto' }}>
                {animating 
                  ? 'We are setting up security partitions, prompt guidelines, and insights calculations.' 
                  : 'Welcome to your new dashboard! Your command center is fully configured.'}
              </p>
            </div>

            {/* Animation Logs Panel */}
            <div style={{
              width: '100%',
              background: '#070a13',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              textAlign: 'left',
              color: 'hsl(var(--text-muted))',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minHeight: '120px'
            }}>
              {setupLogs.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: idx === setupLogs.length - 1 ? 'hsl(var(--secondary-light))' : undefined }}>
                  <span style={{ color: '#22c55e' }}>✓</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              disabled={animating}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                opacity: animating ? 0.5 : 1,
                cursor: animating ? 'not-allowed' : 'pointer'
              }}
            >
              Open Business Command Center
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
