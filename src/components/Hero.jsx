import React from 'react';
import { ArrowRight, Bot, Star, Play, Sparkles } from 'lucide-react';

export default function Hero({ onNavigate }) {
  return (
    <section className="section-padding animate-slide-up" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="hero-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '40px',
        alignItems: 'center',
        width: '100%'
      }}>
        
        {/* Left column - Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div className="badge animate-pulse-glow" style={{ marginBottom: '16px' }}>
              <Sparkles size={14} style={{ marginRight: '6px' }} />
              The AI Revolution for Small Businesses
            </div>
            <h1 style={{ fontSize: 'calc(2.2rem + 1.8vw)', lineHeight: '1.15', marginBottom: '16px' }}>
              Supercharge Your <span className="gradient-text-color">MSME</span> with Custom AI Tools
            </h1>
            <p className="gradient-text" style={{ fontSize: '1.2rem', color: 'hsl(var(--text-secondary))', maxWidth: '600px', lineHeight: '1.6' }}>
              Unlock enterprise-grade AI capabilities built specifically for small businesses. Drive customer leads, capture requirements, and launch customized websites without expensive developers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            <button className="btn-primary" onClick={() => onNavigate('demos')}>
              Try Free Demos <ArrowRight size={18} />
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('wizard')}>
              Get AI Roadmap
            </button>
          </div>

          {/* Social Proof / Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px', 
            marginTop: '40px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '32px'
          }}>
            <div>
              <h3 style={{ fontSize: '2rem', color: 'hsl(var(--secondary-light))' }}>24/7</h3>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>Customer Availability</p>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', color: 'hsl(var(--primary-light))' }}>-60%</h3>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>Operational Costs</p>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', color: 'hsl(var(--accent))' }}>3x</h3>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>Lead Conversion Growth</p>
            </div>
          </div>
        </div>

        {/* Right column - Graphic / Interactive Element */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div className="glass-panel glass-panel-glow" style={{
            width: '100%',
            maxWidth: '420px',
            aspectRatio: '4 / 5',
            padding: '24px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(139, 92, 246, 0.05) 100%)',
            overflow: 'hidden'
          }}>
            {/* Visual background elements */}
            <div style={{
              position: 'absolute',
              top: '-10%',
              right: '-10%',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none'
            }} />
            
            {/* Box Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>AIForMSME Studio</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Active Simulator</span>
            </div>

            {/* Simulated Live Interface */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px', margin: '20px 0' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="btn-icon" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary-light))', flexShrink: 0 }}>
                  <Bot size={20} />
                </div>
                <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: '4px var(--radius-md) var(--radius-md) var(--radius-md)', fontSize: '0.85rem' }}>
                  Hi! I'm your AI agent. How can I help grow your business today?
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'row-reverse' }}>
                <div className="btn-icon" style={{ backgroundColor: 'hsl(var(--secondary) / 0.2)', color: 'hsl(var(--secondary-light))', flexShrink: 0 }}>
                  <Star size={18} />
                </div>
                <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md) 4px var(--radius-md) var(--radius-md)', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)' }}>
                  I'd like to automate client queries and callbacks!
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', opacity: 0.8 }}>
                <div className="btn-icon" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary-light))', flexShrink: 0 }}>
                  <Bot size={20} />
                </div>
                <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: '4px var(--radius-md) var(--radius-md) var(--radius-md)', fontSize: '0.85rem', borderLeft: '2px solid hsl(var(--secondary))' }}>
                  Excellent! Launching **MSMEChat & Website Generator** simulator now...
                </div>
              </div>
            </div>

            {/* Quick Demo CTA */}
            <div className="glass-panel" style={{ 
              padding: '12px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.02)'
            }} onClick={() => onNavigate('demos')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="btn-icon" style={{ width: '32px', height: '32px', backgroundColor: 'hsl(var(--accent) / 0.2)', color: 'hsl(var(--accent))' }}>
                  <Play size={14} fill="currentColor" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem' }}>Interactive Demo</h4>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Click to run chatbot builder</p>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'hsl(var(--text-muted))' }} />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
