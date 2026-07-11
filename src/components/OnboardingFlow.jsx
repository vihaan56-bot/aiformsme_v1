import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Check, ArrowRight, Bot, MessageSquare, Users, Calendar, Megaphone, BadgeDollarSign, ShieldAlert } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

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

    // Save to Firestore
    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'businesses'), businessData);
        businessData.id = docRef.id;
      } catch (err) {
        console.error('[ONBOARDING] Failed to save business to Firestore:', err);
      }
    }

    // Save to LocalStorage fallback for local session mirror (not primary storage)
    try {
      localStorage.setItem('aiformsme_business_config', JSON.stringify(businessData));
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
