import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle, AlertTriangle, Play, HelpCircle, Trophy } from 'lucide-react';

export default function TrainingDemo({ onCompleteTraining }) {
  const [activeTab, setActiveTab] = useState('prompting'); // prompting, compliance
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(null);
  const [promptSubmitted, setPromptSubmitted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
  // Prompt simulation options
  const promptOptions = [
    {
      score: 40,
      grade: 'C-',
      feedback: 'Too vague! The AI doesn\'t know the company guidelines and might agree to a refund, violating bakery policy.',
      aiResponse: 'Customer: "I want a refund on my cake."\nAI Bot: "Okay, I understand you want a refund. Please send your receipt and I will process a full refund right now."',
      text: 'Just handle complaints about custom cakes. Try to keep them happy.'
    },
    {
      score: 75,
      grade: 'B',
      feedback: 'Good, but blunt. The AI follows the rule but doesn\'t maintain customer goodwill or offer alternatives.',
      aiResponse: 'Customer: "I want a refund on my cake."\nAI Bot: "We do not offer refunds on custom cakes. It is against our store policy. We can only give you a discount coupon for next time."',
      text: 'No refunds on custom cakes because they are customized. Tell the customer this and offer a coupon instead.'
    },
    {
      score: 98,
      grade: 'A+',
      feedback: 'Excellent instruction set! Clear tone, detailed policy constraints, and actionable alternative strategies provided.',
      aiResponse: 'Customer: "I want a refund on my cake."\nAI Bot: "I understand your disappointment regarding the cake. Because custom items are custom-baked to order, we are unable to offer a cash refund. However, your satisfaction is very important to us. I\'d love to email you a 20% discount coupon for your next visit, or check if we can bake a replacement treat for you instead. Would that help?"',
      text: 'You are a polite customer support agent. If a customer demands a refund for a custom cake, explain nicely that custom baked items are non-refundable. Instead, offer a 20% discount coupon on their next purchase, or connect them to the store manager if they remain dissatisfied.'
    }
  ];

  // Quiz Questions
  const quizQuestions = [
    {
      id: 'q1',
      question: "An AI customer agent detects a message saying 'I will report you to the Better Business Bureau unless I get a call'. What is the correct protocol?",
      options: [
        { label: "Let the AI bot continue trying to resolve it autonomously.", isCorrect: false },
        { label: "Immediately trigger human escalation, notify management, and take over the chat.", isCorrect: true },
        { label: "Delete the customer message so it doesn't skew dashboard analytics.", isCorrect: false }
      ]
    },
    {
      id: 'q2',
      question: "What is 'Hallucination' in an AI Chatbot context?",
      options: [
        { label: "When the chatbot responds extremely fast.", isCorrect: false },
        { label: "When the AI shuts down due to high volume traffic.", isCorrect: false },
        { label: "When the AI invents incorrect facts (e.g. fake pricing or policies) confidently.", isCorrect: true }
      ]
    }
  ];

  const handleSelectPrompt = (idx) => {
    setSelectedPromptIdx(idx);
    setPromptSubmitted(true);
  };

  const handleQuizAnswer = (qId, optionIdx) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleQuizSubmit = () => {
    if (Object.keys(quizAnswers).length < quizQuestions.length) return;
    setQuizSubmitted(true);
    
    // Check if score is perfect
    const score = quizQuestions.reduce((acc, q) => {
      const selectedOpt = q.options[quizAnswers[q.id]];
      return acc + (selectedOpt?.isCorrect ? 50 : 0);
    }, 0);

    if (score === 100 && onCompleteTraining) {
      onCompleteTraining();
    }
  };

  const resetAll = () => {
    setSelectedPromptIdx(null);
    setPromptSubmitted(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const quizScore = quizQuestions.reduce((acc, q) => {
    const selectedOpt = q.options[quizAnswers[q.id]];
    return acc + (selectedOpt?.isCorrect ? 50 : 0);
  }, 0);

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Academy Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('prompting')}
          className={`nav-link ${activeTab === 'prompting' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none' }}
        >
          Module 1: Prompt Engineering
        </button>
        <button 
          onClick={() => setActiveTab('compliance')}
          className={`nav-link ${activeTab === 'compliance' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none' }}
        >
          Module 2: AI Safety & Compliance
        </button>
      </div>

      {activeTab === 'prompting' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }}>
          
          {/* Prompt Selection Column */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <BookOpen style={{ color: 'hsl(var(--primary-light))' }} size={20} />
                <h3 style={{ fontSize: '1.25rem' }}>Write Guidelines for support AI</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                <strong>Scenario:</strong> A customer asks for a cash refund on a custom-baked cake (non-refundable by policy). Choose the instruction set that guides the AI to behave correctly.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {promptOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPrompt(idx)}
                  className="glass-panel"
                  style={{
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: selectedPromptIdx === idx ? 'hsl(var(--primary) / 0.12)' : 'rgba(255,255,255,0.02)',
                    border: selectedPromptIdx === idx ? '1px solid hsl(var(--primary))' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: '700', color: idx === 0 ? 'hsl(var(--accent))' : idx === 1 ? 'hsl(var(--secondary-light))' : 'hsl(var(--primary-light))' }}>
                      Option {idx + 1}
                    </span>
                    {promptSubmitted && selectedPromptIdx === idx && (
                      <span style={{ fontWeight: '600' }}>Score: {opt.score}/100</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-primary))', fontStyle: 'italic' }}>
                    "{opt.text}"
                  </p>
                </button>
              ))}
            </div>

            {promptSubmitted && (
              <button className="btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={resetAll}>
                Reset Module
              </button>
            )}
          </div>

          {/* Interactive Playground Output Display */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', background: '#070a13', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={16} fill="currentColor" style={{ color: 'hsl(var(--secondary-light))' }} />
                AI Behavior Preview
              </h3>
              
              {!promptSubmitted ? (
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.85rem', fontStyle: 'italic', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                  Select an instruction prompt on the left to see the simulation.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Visual simulated dialogue */}
                  <div style={{
                    padding: '16px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: 'hsl(var(--text-secondary))',
                    whiteSpace: 'pre-line',
                    minHeight: '120px'
                  }}>
                    {promptOptions[selectedPromptIdx].aiResponse}
                  </div>

                  {/* Feedback and grade */}
                  <div className="glass-panel" style={{
                    padding: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: promptOptions[selectedPromptIdx].score >= 80 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: promptOptions[selectedPromptIdx].score >= 80 ? '#22c55e' : 'hsl(var(--accent))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '1.2rem'
                      }}>
                        {promptOptions[selectedPromptIdx].grade}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem' }}>Evaluation Result</h4>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Score: {promptOptions[selectedPromptIdx].score}/100</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                      {promptOptions[selectedPromptIdx].feedback}
                    </p>
                  </div>

                </div>
              )}
            </div>

            {promptSubmitted && promptOptions[selectedPromptIdx].score >= 80 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontSize: '0.85rem', marginTop: '16px' }}>
                <CheckCircle size={16} />
                <span>Passed! You can now move to Module 2.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'compliance' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }}>
          
          {/* Quiz Column */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <HelpCircle style={{ color: 'hsl(var(--accent))' }} size={20} />
                <h3 style={{ fontSize: '1.25rem' }}>AI Safety & Compliance Exam</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                Ensure your staff understands AI safety, escalation protocols, and limits of automation.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {quizQuestions.map((q, qidx) => (
                <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'white', lineHeight: '1.4' }}>
                    Q{qidx + 1}: {q.question}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, oidx) => {
                      const isSelected = quizAnswers[q.id] === oidx;
                      let optionBg = 'rgba(255,255,255,0.02)';
                      let optionBorder = 'rgba(255,255,255,0.06)';

                      if (quizSubmitted) {
                        if (opt.isCorrect) {
                          optionBg = 'rgba(34,197,94,0.1)';
                          optionBorder = '#22c55e';
                        } else if (isSelected) {
                          optionBg = 'rgba(239,68,68,0.1)';
                          optionBorder = 'hsl(var(--accent))';
                        }
                      } else if (isSelected) {
                        optionBg = 'hsl(var(--accent) / 0.12)';
                        optionBorder = 'hsl(var(--accent))';
                      }

                      return (
                        <button
                          key={oidx}
                          disabled={quizSubmitted}
                          onClick={() => handleQuizAnswer(q.id, oidx)}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            background: optionBg,
                            border: `1px solid ${optionBorder}`,
                            borderRadius: '6px',
                            color: 'hsl(var(--text-secondary))',
                            fontSize: '0.8rem',
                            cursor: quizSubmitted ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            border: '1.5px solid white',
                            backgroundColor: isSelected ? 'white' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!quizSubmitted ? (
              <button 
                className="btn-primary" 
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                style={{
                  alignSelf: 'flex-start',
                  background: 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent) / 0.8) 100%)',
                  boxShadow: '0 4px 12px hsl(var(--accent) / 0.3)',
                  opacity: Object.keys(quizAnswers).length < quizQuestions.length ? 0.5 : 1,
                  cursor: Object.keys(quizAnswers).length < quizQuestions.length ? 'not-allowed' : 'pointer'
                }}
              >
                Submit Exam Answers
              </button>
            ) : (
              <button className="btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={resetAll}>
                Retake Exam
              </button>
            )}
          </div>

          {/* Right Column: Certificate Display */}
          <div className="glass-panel" style={{
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#070a13',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {!quizSubmitted || quizScore < 100 ? (
              <div style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', padding: '20px' }}>
                <Trophy size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <h4 style={{ fontSize: '1rem', color: 'white', marginBottom: '8px' }}>Staff AI Certification</h4>
                <p style={{ fontSize: '0.8rem', maxWidth: '240px' }}>
                  Pass the safety compliance exam with 100% score to generate your employee training certificate.
                </p>
              </div>
            ) : (
              <div 
                className="glass-panel animate-slide-up"
                style={{
                  width: '100%',
                  padding: '24px',
                  border: '2px solid gold',
                  background: 'radial-gradient(circle, #1c150c 0%, #070a13 100%)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  boxShadow: '0 0 30px rgba(218, 165, 32, 0.15)',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  color: 'gold'
                }}>
                  <Award size={28} />
                </div>
                
                <h5 style={{ color: 'gold', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
                  Certificate of Achievement
                </h5>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'white', marginBottom: '8px' }}>
                  AI Operations Competency
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '24px' }}>
                  This certifies that the recipient has passed safety compliance protocols for integrating AI tools in business environments.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', fontSize: '0.7rem' }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: '600' }}>AIForMSME Academy</p>
                    <p style={{ color: 'hsl(var(--text-muted))' }}>Issuer</p>
                  </div>
                  <div>
                    <p style={{ color: '#22c55e', fontWeight: '700' }}>VERIFIED SECURE</p>
                    <p style={{ color: 'hsl(var(--text-muted))' }}>Security Standard</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
