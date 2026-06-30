import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hi there! 👋 I am Khushboo, your AIForMSME assistant. Ask me anything about our AI services, the ROI pricing calculator, our bottleneck audits, or signing in!"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || "";

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Local FAQ knowledge base responses for offline/fallback mode
  const getOfflineFaqResponse = (query) => {
    const text = query.toLowerCase();
    
    if (text.includes('chat') || text.includes('bot') || text.includes('msmechat')) {
      return "Our **MSMEChat Bot** is a 24/7 client engagement chatbot. It embeds on your MSME website, intercepts incoming client questions, and refines lead data automatically to save into a spreadsheet.";
    }
    if (text.includes('voice') || text.includes('call') || text.includes('phone') || text.includes('msmevoice')) {
      return "The **MSMEVoice Assistant** is an interactive AI responder for telephones. It transcribes inquiries, provides audio waveforms in real-time, and logs callback requests.";
    }
    if (text.includes('train') || text.includes('academy') || text.includes('staff') || text.includes('msmetrain')) {
      return "The **MSMETrain Staff Academy** is an interactive gamified simulator. It teaches your receptionists and employees how to write prompts, handle client complaints, and earn certified grades.";
    }
    if (text.includes('price') || text.includes('calculator') || text.includes('cost') || text.includes('savings') || text.includes('roi')) {
      return "Our **Savings Pricing Calculator** lets you toggle support volume and average salaries to see exactly how much money and manual labor hours your business saves by switching to AI tools.";
    }
    if (text.includes('audit') || text.includes('wizard') || text.includes('roadmap') || text.includes('consult')) {
      return "The **Consultation Audit Wizard** is a questionnaire that identifies operational bottlenecks and generates a customized AI implementation roadmap file for your business.";
    }
    if (text.includes('login') || text.includes('signup') || text.includes('register') || text.includes('smtp') || text.includes('otp')) {
      return "Our platform supports passwordless **OTP Sign In/Registration** verified through Gmail SMTP securely. Credentials can be configured locally in the server's `.env` file.";
    }
    if (text.includes('name') || text.includes('who are you') || text.includes('what is this')) {
      return "I am Khushboo, the official AI concierge for **AI for MSMEs (AIForMSME)**. Our mission is to build affordable, tailored, high-efficiency AI applications for small and medium businesses.";
    }

    return "That is a great question! AIForMSME enables small businesses to automate workflows, capture customer leads 24/7, and train staff. You can test all 3 of our applications in the **App Demos** tab above!";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = inputVal.trim();
    const updatedMessages = [...messages, { id: Date.now(), sender: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setInputVal('');
    setIsTyping(true);

    if (apiKey.trim()) {
      // Live OpenRouter Assistant
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "AIForMSME Site Assistant",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openrouter/free",
            messages: [
              {
                role: "system",
                content: "You are Khushboo, the official AI concierge for 'AI for MSMEs' (AIForMSME), a business that designs simple, premium, and affordable AI tools to help micro, small, and medium businesses grow. \n\nKey features to discuss:\n- MSMEChat: 24/7 client lead-capture chatbot.\n- MSMEVoice: Interactive phone receptionist with transcribing.\n- MSMETrain: Gamified prompt courses and certifications for staff.\n- Savings Pricing: ROI calculator measuring manual wage reductions.\n- Consultation Audit: bottleneck wizard generating custom roadmaps.\n- Gmail SMTP: Secure passwordless OTP registration.\n\nKeep your answers extremely brief, helpful, and friendly (max 2-3 sentences). Focus on encouraging the user to explore our platform tabs!"
              },
              ...messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
              })),
              { role: "user", content: userMsg }
            ]
          })
        });

        if (!response.ok) throw new Error("Network response failed");
        
        const data = await response.json();
        const botResponse = data.choices[0].message.content;
        
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);

      } catch (err) {
        // Fallback to offline FAQ if network fails
        console.warn("OpenRouter API widget call failed, using local FAQ engine:", err);
        const fallback = getOfflineFaqResponse(userMsg);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: fallback }]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Local Heuristic Assistant
      setTimeout(() => {
        const botResponse = getOfflineFaqResponse(userMsg);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(prev => !isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(6, 182, 212, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          zIndex: 999,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="animate-bounce"
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1) rotate(5deg)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1) rotate(0deg)';
        }}
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>

      {/* Chat Widget Panel */}
      {isOpen && (
        <div 
          className="glass-panel animate-slide-up"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '360px',
            height: '480px',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 182, 212, 0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Sparkles size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', margin: 0 }}>Khushboo (AI Assistant)</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Active support</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'hsl(var(--text-muted))',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages body */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
                  gap: '10px',
                  alignItems: 'flex-start',
                  maxWidth: '85%',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: '0.8rem',
                    lineHeight: '1.5',
                    background: m.sender === 'user' 
                      ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark)) 100%)' 
                      : 'rgba(255, 255, 255, 0.03)',
                    border: m.sender === 'user' 
                      ? 'none' 
                      : '1px solid rgba(255,255,255,0.05)',
                    color: m.sender === 'user' ? 'white' : 'hsl(var(--text-secondary))'
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', opacity: 0.8 }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px 12px 12px 2px',
                  fontSize: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: 'hsl(var(--text-muted))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <RefreshCw size={12} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat input footer */}
          <form 
            onSubmit={handleSend}
            style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              background: 'rgba(5, 8, 20, 0.3)'
            }}
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about AIForMSME..."
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isTyping || !inputVal.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (!inputVal.trim() || isTyping) ? 0.5 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
