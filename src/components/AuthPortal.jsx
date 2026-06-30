import React, { useState } from 'react';
import { Mail, User, ShieldCheck, X, RefreshCw, AlertCircle, Sparkles, Lock, Eye, EyeOff } from 'lucide-react';

export default function AuthPortal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' 
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      setSuccessMsg(data.message);

      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 1000);

    } catch (err) {
      setError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setPassword('');
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
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(6, 182, 212, 0.05) 100%)',
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
            {mode === 'login' ? 'Welcome Back' : 'Create Operator Account'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
            {mode === 'login' 
              ? 'Sign in securely with your operator password.' 
              : 'Set up your MSME operator workspace credentials.'
            }
          </p>
        </div>

        {/* Tab Selection */}
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


        {/* Form elements */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                disabled={loading}
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 38px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'hsl(var(--text-muted))',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
                {mode === 'login' ? 'Logging in...' : 'Registering...'}
              </>
            ) : (mode === 'login' ? 'Log In Operator' : 'Register Operator Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
