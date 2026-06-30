import React, { useState, useEffect, useRef } from 'react';
import { Mail, User, ShieldCheck, X, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function AuthPortal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'otp'
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');

  const timerRef = useRef(null);

  // Countdown timer logic
  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(prev => prev - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, timer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSimulatedOtp('');

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please provide your name to register.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: mode === 'signup' ? name.trim() : '',
          type: mode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification request failed.');
      }

      setSuccessMsg(data.message);
      setTimer(60);
      setStep('otp');

      // If running in simulated mock mode (e.g. SMTP config not set)
      if (data.simulated && data.otp) {
        setSimulatedOtp(data.otp);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.trim().length !== 6 || isNaN(otp.trim())) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed.');
      }

      // Successful verification
      onLoginSuccess(data.user);
      onClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setStep('input');
    setOtp('');
    setSimulatedOtp('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 8, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        className="glass-panel glass-panel-glow animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(6, 182, 212, 0.05) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Close button */}
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
            justifyContent: 'center',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#ffffff'}
          onMouseLeave={(e) => e.target.style.color = 'hsl(var(--text-muted))'}
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="badge" style={{ marginBottom: '12px' }}>
            <Sparkles size={13} style={{ marginRight: '5px' }} />
            AIForMSME Studio Auth
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '6px' }}>
            {step === 'input' 
              ? (mode === 'login' ? 'Welcome Back' : 'Create Operator Account') 
              : 'Enter Security Code'
            }
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
            {step === 'input' 
              ? (mode === 'login' ? 'Sign in securely with your registered email.' : 'Set up your MSME operator workspace.')
              : `We sent a One-Time Password (OTP) to ${email}.`
            }
          </p>
        </div>

        {/* Tab Selection (only visible in input step) */}
        {step === 'input' && (
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '28px'
          }}>
            <button
              onClick={() => switchMode('login')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: mode === 'login' ? 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark)) 100%)' : 'transparent',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Log In
            </button>
            <button
              onClick={() => switchMode('signup')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: mode === 'signup' ? 'linear-gradient(90deg, hsl(var(--secondary)) 0%, hsl(var(--secondary-dark)) 100%)' : 'transparent',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Register
            </button>
          </div>
        )}

        {/* Errors display */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '12px 14px',
            color: 'hsl(0, 100%, 75%)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success messages */}
        {successMsg && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '8px',
            padding: '12px 14px',
            color: '#4ade80',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Simulated Helper OTP Alert */}
        {simulatedOtp && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px dashed rgba(6, 182, 212, 0.3)',
            borderRadius: '8px',
            padding: '14px',
            color: 'hsl(var(--secondary-light))',
            fontSize: '0.8rem',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
              Simulated OTP Verification
            </p>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '4px', color: 'white' }}>
              {simulatedOtp}
            </span>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.7rem', opacity: 0.8 }}>
              No SMTP settings configured in .env yet. Copy this code above to verification box.
            </p>
          </div>
        )}

        {/* Form elements */}
        {step === 'input' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {mode === 'signup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={loading}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 38px',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={loading}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 38px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={mode === 'signup' ? 'btn-primary' : 'btn-secondary'}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '10px',
                fontSize: '0.9rem',
                justifyContent: 'center',
                borderColor: mode === 'login' ? 'hsl(var(--primary) / 0.5)' : undefined
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" style={{ marginRight: '8px' }} />
                  Sending verification code...
                </>
              ) : 'Send OTP Verification'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', alignSelf: 'flex-start' }}>6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0 0 0 0 0 0"
                disabled={loading}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1.4rem',
                  fontWeight: '800',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.9rem',
                justifyContent: 'center'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" style={{ marginRight: '8px' }} />
                  Verifying account...
                </>
              ) : 'Verify Code & Launch'}
            </button>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              marginTop: '6px'
            }}>
              <span style={{ color: 'hsl(var(--text-muted))' }}>
                Didn't get the email?
              </span>
              {timer > 0 ? (
                <span style={{ color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
                  Resend in {timer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'hsl(var(--secondary-light))',
                    cursor: 'pointer',
                    fontWeight: '600',
                    padding: 0
                  }}
                >
                  Resend Verification
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
