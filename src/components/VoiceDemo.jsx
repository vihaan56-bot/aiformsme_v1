import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Grid, Play, ArrowRight, Check } from 'lucide-react';
import { db, isFirebaseConfigured } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function VoiceDemo({ onAddCall }) {
  const [callState, setCallState] = useState('idle'); // idle, dialing, active, ended
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);

  // Speech Recognition & Synthesis State
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || "";

  // Audio wave canvas ref
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timerRef = useRef(null);

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
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        console.log("Transcribed speech input:", resultText);
        handleUserSpeech(resultText);
      };

      setRecognition(rec);
    }
  }, []);

  // Text-To-Speech Engine
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove html tags and filter URL spoken form
      const cleanText = text.replace(/<[^>]*>/g, '').replace(/https?:\/\/[^\s]+/g, 'the link shown on your screen');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => 
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Zira") || v.name.includes("David")) && 
        v.lang.startsWith("en")
      ) || voices.find(v => v.lang.startsWith("en"));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }
      
      utterance.lang = 'en-US';
      utterance.rate = 0.95;

      utterance.onstart = () => setIsBotSpeaking(true);
      utterance.onend = () => setIsBotSpeaking(false);
      utterance.onerror = () => setIsBotSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Sample prompt buttons
  const customerQuestions = [
    { label: "Book a callback", text: "I need to book a consultation callback for tomorrow morning." },
    { label: "Check business hours", text: "Can you tell me your opening hours and address?" },
    { label: "Request pricing", text: "I'd like to get a pricing quote for your standard services." },
    { label: "Make my Website", text: "Please create a website for my business." }
  ];

  // Call Duration Timer
  useEffect(() => {
    if (callState === 'active') {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      if (callState === 'idle') setDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  // Audio Waveform Animation
  useEffect(() => {
    if (callState === 'active' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let angle = 0;

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = isBotSpeaking ? '#06b6d4' : '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const amplitude = isBotSpeaking ? 30 : 5;
        const frequency = isBotSpeaking ? 0.08 : 0.03;

        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + Math.sin(x * frequency + angle) * amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        angle += 0.15;
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();
    } else {
      cancelAnimationFrame(animationRef.current);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [callState, isBotSpeaking]);

  const handleStartCall = () => {
    // Unblock browser SpeechSynthesis scope synchronously on user click!
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(u);
    }
    setCallState('dialing');
    setTranscript([]);
    setTimeout(() => {
      setCallState('active');
      const welcomeText = "Thank you for calling AIForMSME voice center. I am your virtual assistant. How can I help you today?";
      setTranscript([
        { sender: 'bot', text: welcomeText }
      ]);
      speakText(welcomeText);
    }, 2000);
  };

  const handleEndCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
    setCallState('ended');
    const finalCall = {
      duration: formatTime(duration),
      summary: transcript.length > 1 ? "Inquiry resolved / Lead registered" : "Missed / Hangup",
      date: new Date().toLocaleTimeString()
    };
    if (onAddCall) onAddCall(finalCall);
  };

  const handleReset = () => {
    setCallState('idle');
    setTranscript([]);
    setDuration(0);
  };

  // Helper to dynamically build a website via voice triggers
  const createVoiceGeneratedWebsite = async () => {
    const randomSuffix = Math.random().toString(36).substring(7);
    const siteSlug = `voice_site_${randomSuffix}`;
    const siteData = {
      slug: siteSlug,
      bizName: `Voice Generated Business`,
      theme: 'breeze',
      template: 'services',
      title: 'Expert Automation Solutions for Modern Enterprises',
      subtitle: 'Created dynamically via AIForMSME Voice Assistant commands.',
      about: 'This website was built automatically using our interactive voice assistant service module. All modules, design components, and conversational helpers are fully active.',
      products: [
        { name: 'AI Consult Assessment', price: '₹2,500', desc: 'Initial system audit conducted automatically.' },
        { name: 'Managed Automation Plan', price: '₹9,999/mo', desc: 'Full chatbot and IVR routing support package.' }
      ],
      botConfig: {
        bizName: `Voice Generated Business`,
        systemPrompt: "You are a helpful assistant for Voice Generated Business. Give details on our automation capabilities.",
        requireEmail: true,
        requirePhone: false,
        selectedModel: 'openrouter/free',
        apiKey: ''
      },
      enableBot: true
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'websites', siteSlug), siteData);
      } catch (err) {
        console.error('[VOICE GENERATED SITE ERROR]:', err);
      }
    }

    try {
      const stored = JSON.parse(localStorage.getItem('aiformsme_websites') || '{}');
      stored[siteSlug] = siteData;
      localStorage.setItem('aiformsme_websites', JSON.stringify(stored));
    } catch (err) {
      console.error(err);
    }

    return siteSlug;
  };

  const handleUserSpeech = async (text) => {
    if (callState !== 'active') return;

    // Log User Query
    setTranscript(prev => [...prev, { sender: 'user', text }]);
    setIsBotSpeaking(true);

    const updatedTranscript = [...transcript, { sender: 'user', text }];

    if (apiKey.trim()) {
      // Live OpenRouter Assistant Speech Router
      try {
        const systemPrompt = "You are a friendly voice receptionist for AIForMSME. Help clients learn about our automation packages, calculators, or generate custom websites for them. Rules: Keep answers short (1-2 sentences) suitable for a phone call. If they want to build/make a website, tell them you will generate it now.";
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "AIForMSME Voice System",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openrouter/free",
            messages: [
              { role: "system", content: systemPrompt },
              ...updatedTranscript.map(t => ({
                role: t.sender === 'user' ? 'user' : 'assistant',
                content: t.text
              }))
            ]
          })
        });

        if (!response.ok) throw new Error("API call failed");
        const data = await response.json();
        let botText = data.choices[0].message.content;

        const queryLower = text.toLowerCase();
        if (queryLower.includes("website") || queryLower.includes("create a site") || queryLower.includes("build a site") || queryLower.includes("make a site")) {
          const siteSlug = await createVoiceGeneratedWebsite();
          botText += ` I have successfully generated a website for you! You can visit it live at: /${siteSlug}`;
        }

        setTranscript(prev => [...prev, { sender: 'bot', text: botText }]);
        speakText(botText);

      } catch (err) {
        console.error("OpenRouter Voice system failed:", err);
        const fallback = "I apologize, there was an issue processing your query. Could you please say that again?";
        setTranscript(prev => [...prev, { sender: 'bot', text: fallback }]);
        speakText(fallback);
      }
    } else {
      // Offline fallback heuristic
      setTimeout(async () => {
        let botText = "";
        const queryLower = text.toLowerCase();

        if (queryLower.includes("hour") || queryLower.includes("address")) {
          botText = "Our MSME client offices are open Monday to Friday, 9:00 AM to 6:00 PM. We are located downtown at 100 Innovation Way.";
        } else if (queryLower.includes("callback") || queryLower.includes("consultation")) {
          botText = "Sure! I can arrange a specialist callback. I have logged your phone number from this line. We will call you tomorrow morning at 10:00 AM. Does that work?";
        } else if (queryLower.includes("pricing") || queryLower.includes("quote")) {
          botText = "Our basic service starter plan starts at ₹3,999 a month. It includes a custom chatbot and voice router. Would you like to review our plans online?";
        } else if (queryLower.includes("website") || queryLower.includes("create a site") || queryLower.includes("build a site") || queryLower.includes("make a site")) {
          const siteSlug = await createVoiceGeneratedWebsite();
          botText = `Sure! I have generated a custom website for your business. You can view it live at: /${siteSlug}`;
        } else {
          botText = "I've noted that down for you. Is there anything else I can assist you with today?";
        }

        setTranscript(prev => [...prev, { sender: 'bot', text: botText }]);
        speakText(botText);
      }, 1200);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'stretch' }}>
      
      {/* Left Column: Phone Simulator Panel */}
      <div className="glass-panel" style={{
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(6, 182, 212, 0.03) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        position: 'relative'
      }}>
        
        {/* Header Indicator */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={18} style={{ color: 'hsl(var(--secondary-light))' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))' }}>
            MSMEVoice AI Router
          </span>
        </div>

        {/* Voice Engine Indicator */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '0.7rem', color: 'hsl(var(--text-muted))', background: 'rgba(255,255,255,0.02)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
          Voice: Browser SpeechSynthesis
        </div>

        {callState === 'idle' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'hsl(var(--secondary) / 0.1)',
              border: '2px solid hsl(var(--secondary) / 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--secondary-light))',
              marginBottom: '10px'
            }}>
              <Phone size={36} className="animate-pulse-glow" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Test Voice Response (IVR) System</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', maxWidth: '300px' }}>
                Simulate an incoming business call to see how the AI system answers, captures notes, and schedules callbacks.
              </p>
            </div>
            <button className="btn-primary" onClick={handleStartCall} style={{ background: 'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--secondary-light)) 100%)', boxShadow: '0 4px 12px hsl(var(--secondary) / 0.3)' }}>
              Start Simulated Call <Play size={14} fill="currentColor" />
            </button>
          </div>
        )}

        {callState === 'dialing' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div className="btn-icon animate-pulse-glow" style={{ width: '80px', height: '80px', backgroundColor: 'hsl(var(--secondary) / 0.2)', border: 'none', color: 'hsl(var(--secondary-light))' }}>
              <Phone size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Dialing AI Auto-Receptionist...</h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>Connecting to cloud server</p>
            </div>
          </div>
        )}

        {callState === 'active' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            
            {/* Caller details */}
            <div style={{ textAlign: 'center' }}>
              <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>Active Session</span>
              <h3 style={{ fontSize: '1.4rem' }}>AI Auto-Response</h3>
              <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>{formatTime(duration)}</span>
            </div>

            {/* Audio Waveform Canvas */}
            <div style={{ position: 'relative', width: '260px' }}>
              <canvas 
                ref={canvasRef} 
                width={260} 
                height={80} 
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              />
              {/* Listening status indicators */}
              {isListening && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  color: '#4ade80',
                  fontWeight: 'bold',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  <span className="voice-indicator-dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                  Listening...
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button 
                onClick={() => setMuted(!muted)} 
                className="btn-icon" 
                style={{ backgroundColor: muted ? 'hsl(var(--accent) / 0.2)' : 'rgba(255,255,255,0.05)', color: muted ? 'hsl(var(--accent))' : 'white' }}
                title={muted ? "Unmute" : "Mute"}
              >
                {muted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              
              <button 
                onClick={handleEndCall} 
                className="btn-icon" 
                style={{ backgroundColor: '#ef4444', color: 'white', width: '56px', height: '56px', border: 'none' }}
                title="Hang Up"
              >
                <PhoneOff size={22} />
              </button>

              {/* Mic Recognition Activator */}
              {recognition ? (
                <button 
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
                    }
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
                  className="btn-icon voice-indicator-pulse" 
                  style={{ 
                    backgroundColor: isListening ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)', 
                    color: isListening ? '#4ade80' : 'white',
                    border: isListening ? '1px solid #22c55e' : 'none'
                  }}
                  title={isListening ? "Stop Listening" : "Speak Now (Voice-to-Text)"}
                >
                  <Volume2 size={18} />
                </button>
              ) : (
                <button className="btn-icon" disabled title="Speech Recognition Unsupported" style={{ opacity: 0.5 }}>
                  <MicOff size={18} />
                </button>
              )}
            </div>

            {/* Live Interactive Inbound speech triggers */}
            <div style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '12px', textAlign: 'center' }}>
                Select what the customer says:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customerQuestions.map((q, idx) => (
                  <button 
                    key={idx}
                    className="glass-panel"
                    disabled={isBotSpeaking}
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
                      }
                      handleUserSpeech(q.text);
                    }}
                    style={{
                      padding: '10px 14px',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      background: isBotSpeaking ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                      color: isBotSpeaking ? 'hsl(var(--text-muted))' : 'white',
                      cursor: isBotSpeaking ? 'not-allowed' : 'pointer',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{q.label}: <em>"{q.text}"</em></span>
                    <ArrowRight size={14} style={{ color: 'hsl(var(--secondary-light))' }} />
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {callState === 'ended' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--text-muted))',
              marginBottom: '10px'
            }}>
              <Check size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Call Completed</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                The transcript and summary have been successfully logged to the dashboard.
              </p>
            </div>
            <button className="btn-secondary" onClick={handleReset}>
              Simulate Another Call
            </button>
          </div>
        )}

      </div>

      {/* Right Column: Real-Time Call Transcription Console */}
      <div className="glass-panel" style={{
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        background: '#070a13',
        border: '1px solid rgba(255,255,255,0.05)',
        height: '100%',
        minHeight: '450px'
      }}>
        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: callState === 'active' ? '#22c55e' : 'hsl(var(--text-muted))' }} />
            Real-Time Call Transcription Log
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
            A standard audio-to-text log demonstrating MSME operator analytics.
          </p>
        </div>

        {/* Conversation flow logs */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
          {transcript.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
              No call active. Click "Start Simulated Call" to see voice logs in real-time.
            </div>
          ) : (
            transcript.map((line, idx) => (
              <div 
                key={idx} 
                className="animate-slide-up"
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  borderLeft: `2px solid ${line.sender === 'bot' ? 'hsl(var(--secondary))' : 'hsl(var(--primary))'}`,
                  paddingLeft: '12px'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: line.sender === 'bot' ? 'hsl(var(--secondary-light))' : 'hsl(var(--primary-light))', width: '60px', marginTop: '2px' }}>
                  {line.sender === 'bot' ? 'Agent AI' : 'Customer'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-primary))', lineHeight: '1.5' }}>
                  {line.text}
                </div>
              </div>
            ))
          )}
          {isBotSpeaking && (
            <div style={{ display: 'flex', gap: '12px', paddingLeft: '12px', borderLeft: '2px solid hsl(var(--secondary) / 0.5)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'hsl(var(--secondary-light))', width: '60px', opacity: 0.6 }}>
                Agent AI
              </div>
              <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>
                Speaking...
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Dynamic Keyframes for Listening Indicators */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .voice-indicator-pulse {
          animation: pulse-green 1.5s infinite;
          border-radius: 50%;
        }
        .voice-indicator-dot {
          animation: blink 1.2s infinite;
        }
        @keyframes blink {
          50% { opacity: 0.3; }
        }
      `}} />
    </div>
  );
}
