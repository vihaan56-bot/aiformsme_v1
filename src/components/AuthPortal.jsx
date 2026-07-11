import React, { useState } from 'react';
import { Mail, User, ShieldCheck, X, RefreshCw, AlertCircle, Sparkles, Lock, Eye, EyeOff } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

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

    const emailKey = email.toLowerCase().trim();

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

    if (mode === 'signup') {
      // 1. Firebase Auth Signup (when active)
      if (isFirebaseConfigured && auth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, emailKey, password);
          await updateProfile(userCredential.user, { displayName: name.trim() });
          const token = await userCredential.user.getIdToken();
          
          const userData = {
            uid: userCredential.user.uid,
            email: emailKey,
            name: name.trim(),
            role: 'Client Operator',
            token: token
          };

          setSuccessMsg('Account registered successfully via Firebase Auth!');
          setTimeout(() => {
            onLoginSuccess(userData);
            onClose();
          }, 1000);
        } catch (err) {
          console.error('[FIREBASE SIGNUP ERROR]:', err);
          setError(err.message || 'Registration failed in Firebase Auth.');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Legacy fallback: Save to client-side localStorage mirror database first
      try {
        const storedUsers = JSON.parse(localStorage.getItem('aiformsme_users_db') || '{}');
        storedUsers[emailKey] = {
          name: name.trim(),
          email: emailKey,
          password: password
        };
        localStorage.setItem('aiformsme_users_db', JSON.stringify(storedUsers));
      } catch (err) {
        console.error('LocalStorage signup mirror failed:', err);
      }

      // Legacy fallback: Call backend register API
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: emailKey, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed.');
        }

        setSuccessMsg(data.message);
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 1000);
      } catch (err) {
        console.warn('API signup failed or server offline. Authenticating via local mirror:', err);
        setSuccessMsg('Operator workspace created locally!');
        const mockUser = {
          email: emailKey,
          name: name.trim(),
          role: 'Client Operator',
          token: 'session-local-' + Date.now()
        };
        setTimeout(() => {
          onLoginSuccess(mockUser);
          onClose();
        }, 1000);
      } finally {
        setLoading(false);
      }
    } else {
      // mode === 'login'
      // 1. Firebase Auth Login (when active)
      if (isFirebaseConfigured && auth) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, emailKey, password);
          const token = await userCredential.user.getIdToken();
          
          const userData = {
            uid: userCredential.user.uid,
            email: emailKey,
            name: userCredential.user.displayName || emailKey.split('@')[0],
            role: 'Client Operator',
            token: token
          };

          setSuccessMsg('Welcome back! Logged in via Firebase Auth.');
          setTimeout(() => {
            onLoginSuccess(userData);
            onClose();
          }, 1000);
        } catch (err) {
          console.error('[FIREBASE LOGIN ERROR]:', err);
          setError('Invalid email or password in Firebase Auth.');
        } finally {
          setLoading(false);
        }
        return;
      }

      let successData = null;

      // Legacy fallback: Try backend login API
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailKey, password })
        });

        const data = await response.json();

        if (response.ok) {
          successData = data;
        } else {
          console.warn('Backend login returned non-200. Error message:', data.message);
        }
      } catch (err) {
        console.warn('Backend API login unreachable. Falling back to local credentials checks:', err);
      }

      if (successData) {
        setSuccessMsg(successData.message);
        setTimeout(() => {
          onLoginSuccess(successData.user);
          onClose();
        }, 1000);
        setLoading(false);
        return;
      }

      // Legacy fallback: Authenticate via client-side localStorage mirror
      try {
        const storedUsers = JSON.parse(localStorage.getItem('aiformsme_users_db') || '{}');
        const localUser = storedUsers[emailKey];

        if (localUser && localUser.password === password) {
          setSuccessMsg('Welcome back! Logged in via saved credentials.');
          const mockUser = {
            email: emailKey,
            name: localUser.name,
            role: 'Client Operator',
            token: 'session-local-' + Date.now()
          };
          setTimeout(() => {
            onLoginSuccess(mockUser);
            onClose();
          }, 1000);
          return;
        }
      } catch (err) {
        console.error('LocalStorage match check failed:', err);
      }

      setError('Invalid email address or password. Please try again.');
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
        className="auth-portal-card glass-panel glass-panel-glow animate-slide-up"
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
