import React from 'react';
import { Bot, Phone, BookOpen, ArrowRight, Zap, Target, Award } from 'lucide-react';

export default function ServiceCatalog({ onSelectDemo }) {
  const services = [
    {
      id: 'chatbot',
      badge: 'MSMEChat',
      badgeClass: 'badge',
      title: 'Customer Engagement Chatbot & Website Generator',
      description: 'Interact with prospective customers immediately, capture leads, book calls, and generate a fully functional live website with embedded chat support in 30 seconds.',
      icon: <Bot size={24} />,
      color: 'hsl(var(--primary))',
      features: ['24/7 lead capture & booking guard', 'Custom AI model & prompt tuning', 'Instant dynamic website launch', 'Secure Firebase database syncing']
    }
  ];

  return (
    <section className="section-padding" style={{ position: 'relative' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div className="badge" style={{ marginBottom: '16px' }}>
          <Zap size={14} style={{ marginRight: '6px' }} />
          Service Portfolio
        </div>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
          Tailored AI Applications for <span className="gradient-text-color">Your Industry</span>
        </h2>
        <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
          Choose from our suite of small applications. Try them out instantly below using our real-time interactive sandbox environment.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        width: '100%'
      }}>
        {services.map((service, index) => (
          <div 
            key={service.id} 
            className="glass-panel glass-panel-hover"
            style={{
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Row */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${service.color} 20%, transparent 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: `0 8px 16px ${service.color}33`
                }}>
                  {service.icon}
                </div>
                <span className={service.badgeClass}>{service.badge}</span>
              </div>

              <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>{service.title}</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6' }}>
                {service.description}
              </p>

              {/* Feature List */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                {service.features.map((feat, fidx) => (
                  <li key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: service.color }} />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <button 
              className="btn-outline-cyan" 
              onClick={() => onSelectDemo(service.id)}
              style={{
                width: '100%',
                justifyContent: 'center',
                borderColor: service.id === 'chatbot' ? 'hsl(var(--primary) / 0.5)' : service.id === 'training' ? 'hsl(var(--accent) / 0.5)' : 'hsl(var(--secondary) / 0.5)',
                color: service.id === 'chatbot' ? 'hsl(var(--primary-light))' : service.id === 'training' ? 'hsl(var(--accent))' : 'hsl(var(--secondary-light))'
              }}
            >
              Launch Simulator Demo <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
