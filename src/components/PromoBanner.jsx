import React, { useState } from 'react';
import { Bot, Phone, BookOpen, Sparkles, X, Gift, ArrowRight, Check } from 'lucide-react';

export default function PromoBanner({ onClose, onChooseTrial }) {
  const [selected, setSelected] = useState(null);
  const [claiming, setClaiming] = useState(false);

  const trialOptions = [
    {
      id: 'chatbot',
      title: 'MSMEChat Bot & Website Generator',
      description: 'Capture prospective customer leads and answer FAQs 24/7 automatically on your generated site.',
      icon: <Bot size={28} />,
      color: 'hsl(var(--primary-light))',
      borderGlow: 'rgba(139, 92, 246, 0.4)'
    }
  ];

  const handleClaim = () => {
    if (!selected) return;
    setClaiming(true);
    
    // Simulate activation delay
    setTimeout(() => {
      onChooseTrial(selected);
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 8, 20, 0.88)',
      backdropFilter: 'blur(20px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        className="glass-panel glass-panel-glow animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '720px',
          padding: '40px',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(139, 92, 246, 0.05) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'hsl(var(--text-muted))',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {/* Promo Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="badge animate-pulse-glow" style={{ marginBottom: '14px', background: 'rgba(236, 72, 153, 0.12)', borderColor: 'rgba(236, 72, 153, 0.25)', color: 'hsl(var(--accent))' }}>
            <Gift size={13} style={{ marginRight: '5px' }} />
            Exclusive MSME Launch Promo
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '12px' }}>
            Get Your First Month <span className="gradient-text-color">100% Free</span>
          </h2>
          <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '580px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Empower your operations today. Choose **one AI application** below to unlock a full 30-day trial. Zero commitment, no credit card required.
          </p>
        </div>

        {/* Option Selection Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {trialOptions.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className="glass-panel"
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? `2px solid ${opt.color}` : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isSelected ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                  boxShadow: isSelected ? `0 0 20px ${opt.borderGlow}` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
              >
                {/* Selected Checkmark Indicator */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: opt.color,
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                {/* Icon box */}
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: isSelected ? `linear-gradient(135deg, ${opt.color} 20%, transparent 100%)` : 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? '#ffffff' : opt.color,
                  transition: 'all 0.3s'
                }}>
                  {opt.icon}
                </div>

                <h4 style={{ fontSize: '1rem', color: isSelected ? 'white' : 'hsl(var(--text-secondary))', fontWeight: '700' }}>
                  {opt.title}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', lineHeight: '1.5' }}>
                  {opt.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={handleClaim}
            disabled={!selected || claiming}
            className="btn-primary"
            style={{
              padding: '14px 44px',
              fontSize: '1rem',
              opacity: !selected ? 0.5 : 1,
              cursor: !selected ? 'not-allowed' : 'pointer',
              minWidth: '220px',
              justifyContent: 'center'
            }}
          >
            {claiming ? (
              <>Activating Trial...</>
            ) : (
              <>
                Activate Free Trial <ArrowRight size={18} />
              </>
            )}
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'hsl(var(--text-muted))',
              fontSize: '0.85rem',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            No thanks, I will browse first
          </button>
        </div>
      </div>
    </div>
  );
}
