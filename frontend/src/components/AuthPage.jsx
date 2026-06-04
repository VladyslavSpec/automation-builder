import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export default function AuthPage({ onAuth }) {
  const [tab, setTab]                     = useState('login');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirm]     = useState('');
  const [agreeTerms, setAgreeTerms]       = useState(false);
  const [agreePrivacy, setAgreePrivacy]   = useState(false);
  const [rememberMe, setRememberMe]       = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [focusField, setFocus]            = useState(null);
  const [btnHover, setBtnHover]           = useState(false);
  const [view, setView]                   = useState('auth'); // 'auth' | 'forgot' | 'forgot-sent'
  const [forgotEmail, setForgotEmail]     = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const switchTab = (t) => { setTab(t); setError(''); setConfirm(''); setAgreeTerms(false); setAgreePrivacy(false); };
  const goForgot = () => { setView('forgot'); setForgotEmail(email); setError(''); };
  const backToLogin = () => { setView('auth'); setError(''); };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setError('');
    try {
      await axios.post(`${API}/auth/forgot-password`, { email: forgotEmail });
      setView('forgot-sent');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (tab === 'register') {
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      if (!agreeTerms || !agreePrivacy) { setError('Please accept the Terms of Service and Privacy Policy to continue.'); return; }
    }

    setLoading(true);
    try {
      if (tab === 'register') {
        const res = await axios.post(`${API}/auth/register`, { email, password });
        onAuth(res.data.access_token);
      } else {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);
        const loginUrl = `${API}/auth/login${rememberMe ? '?remember_me=true' : ''}`;
        const res = await axios.post(loginUrl, params);
        onAuth(res.data.access_token);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    background: '#080810',
    border: `1px solid ${focusField === field ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 7,
    padding: '10px 13px',
    fontSize: 13,
    fontFamily: 'inherit',
    color: '#e2e8f0',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: focusField === field ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    fontSize: 10,
    color: '#475569',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    display: 'block',
    marginBottom: 5,
  };

  const isRegister = tab === 'register';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#07070f', position: 'relative', overflow: 'hidden',
      padding: '40px 20px',
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-8%', width: 560, height: 560,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-12%', right: '-8%', width: 480, height: 480,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }}/>

      {/* Forgot password card */}
      {view === 'forgot' && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, background: '#0c0c18', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '34px 30px 28px', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s ease both' }}>
          <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }}/>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Reset your password</div>
            <div style={{ fontSize: 12, color: '#475569' }}>Enter your email and we'll send a reset link</div>
          </div>
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 5 }}>Email address</label>
              <input type="email" value={forgotEmail} required onChange={e => setForgotEmail(e.target.value)} placeholder="you@example.com"
                style={{ width: '100%', background: '#080810', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '10px 13px', fontSize: 13, color: '#e2e8f0', outline: 'none', fontFamily: 'inherit' }}/>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '8px 12px', fontSize: 12, color: '#f87171' }}>{error}</div>}
            <button type="submit" disabled={forgotLoading} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: forgotLoading ? 'default' : 'pointer', opacity: forgotLoading ? 0.65 : 1 }}>
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button type="button" onClick={backToLogin} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>← Back to Login</button>
          </div>
        </div>
      )}

      {/* Forgot sent card */}
      {view === 'forgot-sent' && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, background: '#0c0c18', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '40px 30px', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', textAlign: 'center', animation: 'fadeIn 0.3s ease both' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>📬</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Check your email</div>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
            If <strong style={{ color: '#94a3b8' }}>{forgotEmail}</strong> is registered,<br/>you'll receive a reset link shortly.
          </div>
          <button type="button" onClick={backToLogin} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 20px', color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back to Login</button>
        </div>
      )}

      {/* Auth Card */}
      {view === 'auth' && <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
        background: '#0c0c18', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18, padding: '34px 30px 28px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.3s ease both',
      }}>
        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
          borderRadius: 1,
        }}/>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, marginBottom: 26 }}>
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none"
               style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.7)) drop-shadow(0 0 20px rgba(124,58,237,0.4))' }}>
            <defs>
              <linearGradient id="auth-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#auth-g)"/>
            <rect x="9" y="9" width="14" height="14" rx="3" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="2"/>
            <line x1="3" y1="12" x2="9" y2="12" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="3" y1="16" x2="9" y2="16" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="3" y1="20" x2="9" y2="20" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="3" cy="12" r="1.4" fill="white" opacity="0.8"/>
            <circle cx="3" cy="16" r="1.4" fill="white" opacity="0.8"/>
            <circle cx="3" cy="20" r="1.4" fill="white" opacity="0.8"/>
            <line x1="23" y1="16" x2="27" y2="16" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M25 13 L29 16 L25 19" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <div style={{
              fontSize: 18, fontWeight: 800, textAlign: 'center',
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Weavo</div>
            <div style={{ fontSize: 12, color: '#334155', textAlign: 'center', marginTop: 2 }}>
              {isRegister ? 'Create your free account' : 'Welcome back — log in to continue'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9,
          padding: 3, marginBottom: 22, gap: 3,
        }}>
          {[
            { key: 'login',    label: 'Log In',   sub: 'I have an account' },
            { key: 'register', label: 'Register',  sub: 'New user' },
          ].map(({ key, label, sub }) => (
            <button
              key={key}
              type="button"
              onClick={() => switchTab(key)}
              style={{
                flex: 1, padding: '7px 0', border: 'none', borderRadius: 7,
                background: tab === key ? '#6366f1' : 'transparent',
                color: tab === key ? '#fff' : '#64748b',
                fontFamily: 'inherit', cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: tab === key ? '0 0 16px rgba(99,102,241,0.3)' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700 }}>{label}</span>
              <span style={{ fontSize: 9.5, opacity: tab === key ? 0.75 : 0.5, letterSpacing: 0.1 }}>{sub}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Email */}
          <div>
            <label style={labelStyle}>Email address</label>
            <input
              type="email" value={email} required
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle('email')}
              onFocus={() => setFocus('email')}
              onBlur={() => setFocus(null)}
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password" value={password} required
              onChange={e => setPassword(e.target.value)}
              placeholder={isRegister ? 'At least 8 characters' : '••••••••'}
              style={inputStyle('password')}
              onFocus={() => setFocus('password')}
              onBlur={() => setFocus(null)}
            />
          </div>

          {/* Confirm Password — register only */}
          {isRegister && (
            <div>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password" value={confirmPassword} required
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                style={{
                  ...inputStyle('confirm'),
                  borderColor: confirmPassword && confirmPassword !== password
                    ? 'rgba(239,68,68,0.5)'
                    : focusField === 'confirm' ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.08)',
                }}
                onFocus={() => setFocus('confirm')}
                onBlur={() => setFocus(null)}
              />
              {confirmPassword && confirmPassword !== password && (
                <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>Passwords don't match</div>
              )}
            </div>
          )}

          {/* Remember me — login only */}
          {!isRegister && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#6366f1', width: 13, height: 13, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 12, color: '#64748b' }}>Remember me</span>
              </label>
              <button
                type="button"
                onClick={goForgot}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Checkboxes — register only */}
          {isRegister && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
              <CheckboxRow
                checked={agreeTerms}
                onChange={setAgreeTerms}
                id="terms"
              >
                I have read and agree to the{' '}
                <a href="/terms.html" target="_blank" rel="noopener" style={{ color: '#6366f1' }}>Terms of Service</a>
              </CheckboxRow>
              <CheckboxRow
                checked={agreePrivacy}
                onChange={setAgreePrivacy}
                id="privacy"
              >
                I have read and accept the{' '}
                <a href="/privacy.html" target="_blank" rel="noopener" style={{ color: '#6366f1' }}>Privacy Policy</a>
              </CheckboxRow>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 7, padding: '8px 12px', fontSize: 12, color: '#f87171', lineHeight: 1.5,
            }}>{error}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              width: '100%', position: 'relative', overflow: 'hidden',
              padding: '12px', border: 'none', borderRadius: 9,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              fontFamily: 'inherit', cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.65 : 1, marginTop: 4,
              transition: 'box-shadow 0.2s, opacity 0.2s',
              boxShadow: btnHover && !loading ? '0 0 28px rgba(99,102,241,0.45)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {btnHover && !loading && (
              <span style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                animation: 'shimmer 0.6s ease forwards', pointerEvents: 'none',
              }}/>
            )}
            {loading ? (
              <span style={{
                width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }}/>
            ) : isRegister ? 'Create Free Account' : 'Log In to My Account'}
          </button>
        </form>

        {/* Bottom hint */}
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#334155' }}>
          {isRegister
            ? <>Already have an account?{' '}<button type="button" onClick={() => switchTab('login')} style={{ background:'none', border:'none', color:'#6366f1', cursor:'pointer', fontSize:12, fontFamily:'inherit', padding:0 }}>Log in</button></>
            : <>Don't have an account yet?{' '}<button type="button" onClick={() => switchTab('register')} style={{ background:'none', border:'none', color:'#6366f1', cursor:'pointer', fontSize:12, fontFamily:'inherit', padding:0 }}>Register for free</button></>
          }
        </div>
      </div>}

      {/* Page footer */}
      <div style={{
        position: 'relative', zIndex: 1, marginTop: 28,
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        fontSize: 11.5, color: '#1e2a3a',
      }}>
        <span>© 2026 Weavo</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <a href="/privacy.html" target="_blank" rel="noopener"
          style={{ color: '#2d3a4d', textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.color = '#64748b'}
          onMouseLeave={e => e.target.style.color = '#2d3a4d'}
        >Privacy Policy</a>
        <span style={{ opacity: 0.3 }}>·</span>
        <a href="/terms.html" target="_blank" rel="noopener"
          style={{ color: '#2d3a4d', textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.color = '#64748b'}
          onMouseLeave={e => e.target.style.color = '#2d3a4d'}
        >Terms of Service</a>
      </div>
    </div>
  );
}

function CheckboxRow({ checked, onChange, id, children }) {
  return (
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
          background: checked ? '#6366f1' : 'transparent',
          border: `1.5px solid ${checked ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', cursor: 'pointer',
          boxShadow: checked ? '0 0 8px rgba(99,102,241,0.4)' : 'none',
        }}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.5, userSelect: 'none' }}>
        {children}
      </span>
    </label>
  );
}
