import React, { useState } from 'react';
import { Sparkles, HelpCircle, FileText, CheckCircle, ChevronRight, Download, Send, ArrowRight } from 'lucide-react';

export default function ConsultationWizard() {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [bottleneck, setBottleneck] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [bizName, setBizName] = useState("");
  const [email, setEmail] = useState("");

  const handleNext = () => {
    if (step === 1 && !industry) return;
    if (step === 2 && !size) return;
    if (step === 3 && !bottleneck) return;
    setStep(prev => prev + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ownerName || !bizName || !email) return;
    setStep(5); // Show customized roadmap
  };

  const getRecommendedAction = () => {
    switch (bottleneck) {
      case 'inquiries':
        return {
          title: 'Deploy MSMEChat Agent Widget',
          description: 'Deploy our Customer Engagement Chatbot directly to your website. It will resolve up to 70% of inbound client questions and log customer details directly to your spreadsheet.',
          metrics: 'Estimated response speed improvement: 24x faster (instant)'
        };
      case 'calls':
        return {
          title: 'Set up MSMEVoice AI Receptionist',
          description: 'Integrate our Automated Voice Agent with your local business telephone line. It will transcribe voicemails, take appointments, and send callback alerts to your phone.',
          metrics: 'Estimated manual phone labor saved: 15 hours/week'
        };
      case 'training':
        return {
          title: 'Enroll Staff in AI Academy',
          description: 'Register your receptionists and workers in our gamified AI training simulator. Ensure they know how to prompt models, handle customer support, and enforce company policies.',
          metrics: 'Estimated upskilling cycle: 3 days to certification'
        };
      default:
        return {
          title: 'Integrated AI Hub System',
          description: 'Integrate chatbot and automated phone answering together to streamline client operations completely.',
          metrics: 'Estimated overall overhead savings: 60% reduction'
        };
    }
  };

  const downloadRoadmap = () => {
    const action = getRecommendedAction();
    const docText = `
AIForMSME ACTION PLAN REPORT
============================
Business Name: ${bizName}
Owner Name: ${ownerName}
Industry: ${industry}
Business Size: ${size} Employees
Primary Bottleneck: ${bottleneck === 'inquiries' ? 'Customer Inquiries' : bottleneck === 'calls' ? 'Phone Scheduling' : 'Staff AI Competency'}

RECOMMENDED ROADMAP:
--------------------
1. Primary Goal: ${action.title}
   - Description: ${action.description}
   - Target Metric: ${action.metrics}

2. Next Implementation Steps:
   - Step 1: Personalize System Prompts for ${bizName}
   - Step 2: Test chatbot & voice widgets using simulation sandbox
   - Step 3: Train staff with AI Academy gamified compliance quizzes
   - Step 4: Connect widget to web domain and go-live!

Report generated on: ${new Date().toLocaleDateString()}
    `;
    const blob = new Blob([docText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${bizName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_ai_roadmap.txt`);
    a.click();
  };

  const recommendation = getRecommendedAction();

  return (
    <div className="animate-slide-up" style={{ maxWidth: '650px', margin: '0 auto' }}>
      
      {step < 5 && (
        <div className="glass-panel" style={{ padding: '40px', position: 'relative' }}>
          
          {/* Progress Indicators */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[1, 2, 3, 4].map(s => (
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

          {/* Step 1: Industry */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Which industry represents your business?</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>This helps us tailor specific prompt models and compliance policies.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {['Retail / E-Commerce', 'Food & Beverage', 'Professional Services', 'Healthcare / Clinic', 'Logistics / Transport', 'Other'].map(ind => (
                  <button 
                    key={ind} 
                    onClick={() => setIndustry(ind)}
                    className="glass-panel"
                    style={{
                      padding: '16px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: industry === ind ? 'hsl(var(--primary) / 0.12)' : 'rgba(255,255,255,0.02)',
                      border: industry === ind ? '1px solid hsl(var(--primary))' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      textAlign: 'left'
                    }}
                  >
                    {ind}
                  </button>
                ))}
              </div>

              <button 
                className="btn-primary" 
                onClick={handleNext} 
                disabled={!industry}
                style={{ alignSelf: 'flex-end', opacity: !industry ? 0.5 : 1, cursor: !industry ? 'not-allowed' : 'pointer' }}
              >
                Next Step <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Size */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>What is the size of your team?</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Allows us to estimate licenses needed for AI staff training academy.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {['1-5 employees (Micro)', '6-20 employees (Small)', '21-100 employees (Medium)', '100+ employees'].map(sz => (
                  <button 
                    key={sz} 
                    onClick={() => setSize(sz)}
                    className="glass-panel"
                    style={{
                      padding: '16px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: size === sz ? 'hsl(var(--primary) / 0.12)' : 'rgba(255,255,255,0.02)',
                      border: size === sz ? '1px solid hsl(var(--primary))' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      textAlign: 'left'
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button 
                  className="btn-primary" 
                  onClick={handleNext} 
                  disabled={!size}
                  style={{ opacity: !size ? 0.5 : 1, cursor: !size ? 'not-allowed' : 'pointer' }}
                >
                  Next Step <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Bottleneck */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>What is your primary operational challenge?</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Select the main bottleneck we need to automate.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { value: 'inquiries', label: 'Handling client inquiries & capturing leads online' },
                  { value: 'calls', label: 'Answering phone callbacks & scheduling appointments manually' },
                  { value: 'training', label: 'Training and onboarding staff on tools & workflow rules' }
                ].map(bot => (
                  <button 
                    key={bot.value} 
                    onClick={() => setBottleneck(bot.value)}
                    className="glass-panel"
                    style={{
                      padding: '16px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: bottleneck === bot.value ? 'hsl(var(--primary) / 0.12)' : 'rgba(255,255,255,0.02)',
                      border: bottleneck === bot.value ? '1px solid hsl(var(--primary))' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      textAlign: 'left'
                    }}
                  >
                    {bot.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button 
                  className="btn-primary" 
                  onClick={handleNext} 
                  disabled={!bottleneck}
                  style={{ opacity: !bottleneck ? 0.5 : 1, cursor: !bottleneck ? 'not-allowed' : 'pointer' }}
                >
                  Next Step <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Contact details */}
          {step === 4 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Receive your custom report</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Input your contact details to generate your tailored AI roadmap report.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="owner-name-input" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Your Full Name</label>
                  <input 
                    id="owner-name-input"
                    type="text" 
                    required 
                    value={ownerName} 
                    onChange={(e) => setOwnerName(e.target.value)} 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="biz-name-input" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Business Name</label>
                  <input 
                    id="biz-name-input"
                    type="text" 
                    required 
                    value={bizName} 
                    onChange={(e) => setBizName(e.target.value)} 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="work-email-input" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Work Email Address</label>
                  <input 
                    id="work-email-input"
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setStep(3)}>Back</button>
                <button type="submit" className="btn-primary">
                  Generate Roadmap Report <Send size={16} />
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* Step 5: Customized AI Action Plan / Roadmap Output */}
      {step === 5 && (
        <div className="glass-panel" style={{
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(6,182,212,0.04) 100%)',
          border: '2px solid hsl(var(--secondary) / 0.3)',
          boxShadow: 'var(--shadow-glow)'
        }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px', marginBottom: '24px' }}>
            <div>
              <div className="badge badge-cyan" style={{ marginBottom: '8px' }}>Roadmap Generated</div>
              <h3 style={{ fontSize: '1.6rem' }}>AI Action Plan: {bizName}</h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Prepared for {ownerName} | Industry: {industry}</p>
            </div>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={downloadRoadmap}>
              <Download size={14} style={{ marginRight: '6px' }} /> Download Report
            </button>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid hsl(var(--secondary))', background: 'rgba(255,255,255,0.01)' }}>
              <h4 style={{ color: 'hsl(var(--secondary-light))', fontSize: '0.95rem', marginBottom: '6px' }}>Recommended Priority Solution</h4>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{recommendation.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5', marginBottom: '12px' }}>
                {recommendation.description}
              </p>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#22c55e' }}>{recommendation.metrics}</span>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'white', marginBottom: '12px' }}>Implementation Timeline</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                
                {/* Step 1 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-30px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary))', boxShadow: '0 0 6px hsl(var(--primary))' }} />
                  <h5 style={{ fontSize: '0.85rem', fontWeight: '700' }}>Step 1: Set Guidelines</h5>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Draft company policies, pricing guidelines, and custom chatbot system instructions.</p>
                </div>

                {/* Step 2 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-30px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'hsl(var(--secondary))', boxShadow: '0 0 6px hsl(var(--secondary))' }} />
                  <h5 style={{ fontSize: '0.85rem', fontWeight: '700' }}>Step 2: Simulate & Test</h5>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Run interactive sandbox chatbot/voice logs to ensure AI behaves within constraints.</p>
                </div>

                {/* Step 3 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-30px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'hsl(var(--accent))', boxShadow: '0 0 6px hsl(var(--accent))' }} />
                  <h5 style={{ fontSize: '0.85rem', fontWeight: '700' }}>Step 3: Train Staff Academy</h5>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Enroll workers to pass compliance and safety tests, certifying prompt proficiency.</p>
                </div>

                {/* Step 4 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-30px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                  <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#22c55e' }}>Step 4: Go-Live Deployment</h5>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Embed chatbot to domain and forward voice phone line to start auto-handling calls.</p>
                </div>

              </div>
            </div>

          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
            <button className="btn-primary" onClick={() => setStep(1)}>
              Restart Wizard
            </button>
            <a href="#pricing" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center' }}>
              View pricing options <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </a>
          </div>

        </div>
      )}

    </div>
  );
}
