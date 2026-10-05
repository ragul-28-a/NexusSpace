import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, LogIn, UserPlus, Lock, Mail, User, Loader2, ShieldAlert } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { signIn, signUp } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Form Validation
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (mode === 'register' && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Invalid email or password.');
          addToast('Login failed. Please check credentials.', 'error');
        } else {
          addToast('Successfully signed in!', 'success');
          onClose();
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setErrorMsg(error.message || 'Registration failed.');
          addToast('Registration failed.', 'error');
        } else {
          addToast('Account created! Welcome to NexusSpace.', 'success');
          onClose();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        
        {/* Header Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
          <button
            style={{
              flex: 1,
              padding: '1rem',
              background: 'none',
              border: 'none',
              color: mode === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              borderBottom: mode === 'login' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onClick={() => { setMode('login'); setErrorMsg(''); }}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>

          <button
            style={{
              flex: 1,
              padding: '1rem',
              background: 'none',
              border: 'none',
              color: mode === 'register' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              borderBottom: mode === 'register' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onClick={() => { setMode('register'); setErrorMsg(''); }}
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </button>

          <button
            onClick={onClose}
            style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {mode === 'login' 
                ? 'Sign in to access your projects and tasks' 
                : 'Register as a new user to start managing your projects'}
            </p>
          </div>

          {errorMsg && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Admin Credentials Info Box */}
          {mode === 'login' && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              marginBottom: '1rem',
              color: 'var(--text-muted)'
            }}>
              <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Admin Credentials:
              </div>
              <div>Email: <code style={{ color: '#22d3ee' }}>admin@nexusspace.io</code></div>
              <div>Password: <code style={{ color: '#22d3ee' }}>AdminPassword123!</code></div>
            </div>
          )}

          {mode === 'register' && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Register
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
