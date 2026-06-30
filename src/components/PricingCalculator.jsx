import React, { useState } from 'react';
import { BadgeDollarSign, HelpCircle, Check, Sparkles } from 'lucide-react';

export default function PricingCalculator() {
  // Calculator metrics
  const [conversations, setConversations] = useState(1000);
  const [callMinutes, setCallMinutes] = useState(250);
  const [staffCount, setStaffCount] = useState(1);
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, annual

  // Math variables in INR (Rupees)
  const basePrice = 3999;
  const chatCost = 4; // ₹4 per message/conversation
  const voiceCost = 12; // ₹12 per call minute
  
  // Salary estimation for full-time support employee in small business (e.g. ₹35,000/mo)
  const employeeSalary = 35000;

  const aiCostMonthly = Math.round(basePrice + (conversations * chatCost) + (callMinutes * voiceCost));
  const humanCostMonthly = staffCount * employeeSalary;
  const savingsMonthly = humanCostMonthly - aiCostMonthly;

  const finalAiCost = billingCycle === 'annual' ? Math.round(aiCostMonthly * 0.8) : aiCostMonthly;
  const finalHumanCost = humanCostMonthly;
  const finalSavings = finalHumanCost - (finalAiCost * (billingCycle === 'annual' ? 12 : 1) / (billingCycle === 'annual' ? 12 : 1));

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Visual Header */}
      <div style={{ textAlign: 'center' }}>
        <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>
          <BadgeDollarSign size={14} style={{ marginRight: '6px' }} />
          ROI & Savings Calculator
        </div>
        <h3 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Calculate Your operational cost savings</h3>
        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', maxWidth: '500px', margin: '0 auto' }}>
          Adjust the sliders below to see the cost comparison between standard manual processes and automated AI solutions.
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px', alignItems: 'stretch' }}>
        
        {/* Sliders Form Panel */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Chat slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Monthly Chatbot Conversations</span>
              <span style={{ color: 'hsl(var(--primary-light))' }}>{conversations.toLocaleString()} chats</span>
            </div>
            <input 
              type="range" 
              min={100} 
              max={10000} 
              step={100}
              value={conversations} 
              onChange={(e) => setConversations(Number(e.target.value))}
              style={{ accentColor: 'hsl(var(--primary))', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
              <span>100 chats</span>
              <span>10,000 chats</span>
            </div>
          </div>

          {/* Voice slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Monthly Voice Call Minutes</span>
              <span style={{ color: 'hsl(var(--secondary-light))' }}>{callMinutes.toLocaleString()} mins</span>
            </div>
            <input 
              type="range" 
              min={10} 
              max={2000} 
              step={10}
              value={callMinutes} 
              onChange={(e) => setCallMinutes(Number(e.target.value))}
              style={{ accentColor: 'hsl(var(--secondary))', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
              <span>10 mins</span>
              <span>2,000 mins</span>
            </div>
          </div>

          {/* Staff slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Displaced Human Effort (Employee equivalents)</span>
              <span style={{ color: 'hsl(var(--accent))' }}>{staffCount} Full-Time Equivalent</span>
            </div>
            <input 
              type="range" 
              min={1} 
              max={10} 
              step={1}
              value={staffCount} 
              onChange={(e) => setStaffCount(Number(e.target.value))}
              style={{ accentColor: 'hsl(var(--accent))', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
              <span>1 Employee</span>
              <span>10 Employees</span>
            </div>
          </div>

          {/* Toggle billing */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            background: 'rgba(255,255,255,0.03)', 
            padding: '4px', 
            borderRadius: '8px', 
            border: '1px solid rgba(255,255,255,0.05)',
            marginTop: '8px'
          }}>
            <button 
              onClick={() => setBillingCycle('monthly')}
              style={{
                flex: 1,
                background: billingCycle === 'monthly' ? 'rgba(255,255,255,0.08)' : 'none',
                border: 'none',
                color: billingCycle === 'monthly' ? 'white' : 'hsl(var(--text-muted))',
                padding: '8px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Monthly Billing
            </button>
            <button 
              onClick={() => setBillingCycle('annual')}
              style={{
                flex: 1,
                background: billingCycle === 'annual' ? 'rgba(255,255,255,0.08)' : 'none',
                border: 'none',
                color: billingCycle === 'annual' ? 'white' : 'hsl(var(--text-muted))',
                padding: '8px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Annual Billing (Save 20%)
            </button>
          </div>

        </div>

        {/* Calculation Result Display */}
        <div className="glass-panel" style={{
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(139,92,246,0.05) 100%)',
          border: '1px solid hsl(var(--primary) / 0.25)',
          boxShadow: 'var(--shadow-glow)'
        }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '1rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost Analysis Summary</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Manual Staff Wages Estimations:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'white' }}>₹{finalHumanCost.toLocaleString()}/mo</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>AIForMSME Cost estimation:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'hsl(var(--secondary-light))' }}>₹{finalAiCost.toLocaleString()}/mo</span>
            </div>

            {/* Savings Display */}
            <div style={{ 
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              margin: '10px 0'
            }}>
              <span style={{ fontSize: '0.8rem', color: '#22c55e', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                Estimated Monthly Savings
              </span>
              <h3 style={{ fontSize: '2.2rem', color: '#22c55e', fontWeight: '800' }}>
                ₹{Math.round(finalSavings).toLocaleString()}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
                Equivalent to ₹{Math.round(finalSavings * 12).toLocaleString()} saved annually!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
              <Check size={14} style={{ color: '#22c55e' }} />
              Includes customized chatbot widget
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
              <Check size={14} style={{ color: '#22c55e' }} />
              Includes call-forwarding voice agent
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Select Starter Bundle & Deploy <Sparkles size={16} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
