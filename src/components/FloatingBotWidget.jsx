import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, RefreshCw, Volume2 } from 'lucide-react';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function FloatingBotWidget({ bizName, botConfig, themeColors, ownerEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Bot configuration options
  const systemPrompt = botConfig?.systemPrompt || `You are an assistant for ${bizName}.`;
  const requireEmail = botConfig?.requireEmail ?? true;
  const requirePhone = botConfig?.requirePhone ?? false;
  const apiKey = botConfig?.apiKey || import.meta.env.VITE_OPENROUTER_API_KEY || '';
  const selectedModel = botConfig?.selectedModel || 'openrouter/free';

  // Lead tracking local state
  const [collectedData, setCollectedData] = useState({ name: '', email: '', phone: '', note: '' });
  const [leadCaptured, setLeadCaptured] = useState(false);

  // Speech Recognition & Synthesis State
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [voiceActive, setVoiceActive] = useState(false);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setVoiceActive(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e) => {
        console.error("Chat Voice Recognition Error:", e);
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        console.log("Transcribed chat speech input:", resultText);
        setInputVal('');
        executeMessageSend(resultText);
      };

      setRecognition(rec);
    }
  }, []);

  // Text-To-Speech Engine
  const speakText = (text) => {
    if (voiceActive && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/<[^>]*>/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Silence speech on close
  useEffect(() => {
    if (!isOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  const chatEndRef = useRef(null);

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: `Hi! Welcome to ${bizName}. How can I assist you today? Ask about our products or details!`
      }
    ]);
  }, [bizName]);

  // Scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Form styles based on themeColors
  const themePrimary = `hsl(${themeColors.primary})`;
  const themeCard = `hsl(${themeColors.bgCard})`;
  const themeText = `hsl(${themeColors.text})`;
  const themeMuted = `hsl(${themeColors.textMuted})`;
  const themeBorder = `hsl(${themeColors.borderColor})`;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const userMsg = inputVal.trim();
    executeMessageSend(userMsg);
    setInputVal('');
  };

  const executeMessageSend = async (userMsg) => {
    const updatedMessages = [...messages, { id: Date.now(), sender: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setIsTyping(true);

    if (apiKey.trim()) {
      // Live OpenRouter Assistant
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": `${bizName} AI Assistant`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: "system",
                content: `${systemPrompt} Rules: Act strictly within this description. Keep responses extremely brief and focused (max 2 sentences).`
              },
              ...messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
              })),
              { role: "user", content: userMsg }
            ]
          })
        });

        if (!response.ok) throw new Error("API request failed");
        
        const data = await response.json();
        const botResponse = data.choices[0].message.content;
        
        const finalMessages = [...updatedMessages, { id: Date.now() + 1, sender: 'bot', text: botResponse }];
        setMessages(finalMessages);
        speakText(botResponse);

        // Scan for leads
        triggerLeadCapture(finalMessages);

      } catch (err) {
        console.error("OpenRouter widget call failed:", err);
        const errText = "Service temporarily unavailable. How else can I help?";
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: errText }]);
        speakText(errText);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Offline fallback heuristic
      setTimeout(() => {
        let botResponse = "";
        const textLower = userMsg.toLowerCase();
        
        const emailMatch = userMsg.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
        const hasEmail = emailMatch && emailMatch.length > 0;
        const cleanPhoneNum = userMsg.replace(/[^0-9]/g, "");
        const hasPhone = cleanPhoneNum.length >= 7 && cleanPhoneNum.length <= 15;

        if (textLower.includes("hello") || textLower.includes("hi") || textLower.includes("hey")) {
          botResponse = `Hello! Welcome to ${bizName}. What information or service are you interested in today?`;
        } 
        else if (textLower.includes("order") || textLower.includes("price") || textLower.includes("buy") || textLower.includes("book") || textLower.includes("cost")) {
          botResponse = `I'd love to help you with your inquiry! May I know your name to get started?`;
        } 
        else if (hasEmail) {
          botResponse = `Thank you for your email (${emailMatch[0]}). I have saved your contact details. Our team will reach out shortly!`;
        }
        else if (hasPhone) {
          botResponse = `Thank you, I've noted your phone number. What details or custom requests should we know?`;
        }
        else if (collectedData.name === '') {
          const name = userMsg;
          setCollectedData(prev => ({ ...prev, name }));
          botResponse = `Nice to meet you, ${name}! ` + 
            (requireEmail ? `What email address should we use to send you details?` : 
            (requirePhone ? `What phone number can we call you on?` : `Could you provide some detail on what you need?`));
        } 
        else {
          botResponse = `Got it! I have recorded your requirements. A representative will contact you soon. Thank you!`;
        }

        const finalMessages = [...updatedMessages, { id: Date.now() + 1, sender: 'bot', text: botResponse }];
        setMessages(finalMessages);
        speakText(botResponse);

        triggerLeadCapture(finalMessages);
        setIsTyping(false);
      }, 1000);
    }
  };

  const getNoteSummary = (chatConcat) => {
    const text = chatConcat.toLowerCase();
    if (text.includes("cake") || text.includes("pastry")) return "Bakery order inquiry";
    if (text.includes("class") || text.includes("train") || text.includes("membership")) return "Fitness studio membership request";
    if (text.includes("consult") || text.includes("strateg")) return "Professional consulting callback";
    return "Website assistant inquiry";
  };

  // Lead Capture logic: parse contact information and write to Firestore
  const triggerLeadCapture = async (chatList) => {
    if (leadCaptured) return;

    // 1. Check if contact info is present
    const chatConcat = chatList.map(m => m.text).join(' ');
    
    // Email extraction
    const emailMatch = chatConcat.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    const email = emailMatch ? emailMatch[0] : '';

    // Phone extraction
    const phoneMatches = chatList.map(m => m.text.replace(/[^0-9]/g, ""));
    const phone = phoneMatches.find(p => p.length >= 7 && p.length <= 15) || '';

    // Require specific configurations to trigger capture
    if ((requireEmail && !email) || (requirePhone && !phone)) return;
    if (!email && !phone) return; // Skip if no contact info at all

    // Deduplicate in session using localStorage cache or similar
    const cacheKey = `aiformsme_cap_${bizName.replace(/\s+/g, '')}`;
    if (sessionStorage.getItem(cacheKey)) return;
    
    // Set states
    setLeadCaptured(true);
    sessionStorage.setItem(cacheKey, 'true');

    // Extract name
    let name = 'Customer';
    for (let i = 0; i < chatList.length; i++) {
      if (chatList[i].sender === 'bot' && (chatList[i].text.includes("your name") || chatList[i].text.includes("know your name"))) {
        const next = chatList[i + 1]?.text;
        if (next) {
          name = next.replace(/my name is/i, "").replace(/i am/i, "").trim().split(' ')[0];
          break;
        }
      }
    }

    const newLead = {
      name: name.slice(0, 20),
      email: email || 'N/A',
      phone: phone || 'N/A',
      note: getNoteSummary(chatConcat),
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      source: `${bizName} Chatbot`,
      ownerEmail: ownerEmail || 'anonymous'
    };

    console.log('[LEAD CAPTURED] Saving to Firestore:', newLead);

    // Save to Firestore
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'leads'), newLead);
      } catch (err) {
        console.error('[LEAD CAPTURED] Firestore write failed:', err);
      }
    }

    // Always mirror to localStorage for real-time local sync fallback
    try {
      const stored = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
      localStorage.setItem('aiformsme_leads', JSON.stringify([newLead, ...stored]));
      
      // Emit event
      window.dispatchEvent(new Event('aiformsme_lead_added'));
    } catch (err) {
      console.error(err);
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
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: themePrimary,
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          transition: 'transform 0.2s'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Widget Panel */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '340px',
            height: '450px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: themeCard,
            border: `1px solid ${themeBorder}`,
            boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
            borderRadius: '16px',
            fontFamily: 'sans-serif'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: `1px solid ${themeBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: themePrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Bot size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', margin: 0 }}>{bizName} Assistant</h4>
                <span style={{ fontSize: '0.7rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
                  gap: '8px',
                  alignItems: 'flex-start',
                  maxWidth: '85%',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: '0.8rem',
                    lineHeight: '1.4',
                    background: m.sender === 'user' ? themePrimary : 'rgba(255, 255, 255, 0.04)',
                    border: m.sender === 'user' ? 'none' : `1px solid ${themeBorder}`,
                    color: 'white'
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '12px 12px 12px 2px',
                  fontSize: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${themeBorder}`,
                  color: themeMuted,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <RefreshCw size={12} className="animate-spin" />
                  Typing...
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form 
            onSubmit={handleSend}
            style={{
              padding: '12px 16px',
              borderTop: `1px solid ${themeBorder}`,
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.1)'
            }}
          >
            {recognition && (
              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    recognition.stop();
                  } else {
                    try {
                      recognition.start();
                    } catch(e) {
                      console.error(e);
                    }
                  }
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: isListening ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: isListening ? '#4ade80' : 'white',
                  border: isListening ? '1px solid #22c55e' : `1px solid ${themeBorder}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isListening ? '0 0 10px rgba(34, 197, 94, 0.5)' : 'none'
                }}
                title={isListening ? "Listening... Click to stop" : "Speak (Voice input)"}
              >
                <Volume2 size={14} className={isListening ? "voice-indicator-dot" : ""} />
              </button>
            )}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={isListening ? "Listening..." : "Type message..."}
              disabled={isTyping || isListening}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${themeBorder}`,
                borderRadius: '6px',
                color: 'white',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isTyping || !inputVal.trim()}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: themePrimary,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (!inputVal.trim() || isTyping) ? 0.5 : 1
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s infinite linear; }
        .voice-indicator-dot { animation: blink 1.2s infinite; }
        @keyframes blink { 50% { opacity: 0.3; } }
      `}} />
    </>
  );
}
