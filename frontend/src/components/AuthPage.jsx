import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

/* ─── Inline style constants ──────────────────────────────── */
const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#07070f',
    position: 'relative',
    overflow: 'hidden',
  },

  blob1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  blob2: {
    position: 'absolute',
    bottom: '-15%',
    right: '-10%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  card: {
    position: 'relative',
    zIndex: 1,
    width: 400,
    background: '#0c0c18',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '36px 32px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    animation: 'fadeIn 0.35s ease both',
  },

  topGlow: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
    borderRadius: 1,
  },

  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },

  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(99,102,241,0.35)',
    flexShrink: 0,
  },

  logoText: {
    fontSize: 17,
    fontWeight: 800,
    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.2,
  },

  logoSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 1,
  },

  tabsWrapper: {
    display: 'flex',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 3,
    marginBottom: 24,
    gap: 3,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },

  label: {
    fontSize: 10,
    color: '#475569',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },

  input: {
    width: '100%',
    background: '#080810',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '10px 14px',
    fontSize: 13,
    fontFamily: 'inherit',
    color: '#e2e8f0',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },

  error: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 12,
    color: '#f87171',
    lineHeight: 1.4,
  },

  submitBtn: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    padding: '12px',
    border: 'none',
    borderRadius: 8,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s, opacity 0.2s',
    marginTop: 4,
  },

  bottomNote: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 11,
    color: '#334155',
  },
};

/* ─── SVG Logo Icon ──────────────────────────────────────── */
function LogoIcon() {
  return (
    <div style={styles.logoIcon}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.9)" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.6)" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.6)" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.4)" />
      </svg>
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────── */
export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocus, setInputFocus] = useState(null); // 'email' | 'password'
  const [btnHover, setBtnHover] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'register') {
        const res = await axios.post(`${API}/auth/register`, { email, password });
        onAuth(res.data.access_token);
      } else {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);
        const res = await axios.post(`${API}/auth/login`, params);
        onAuth(res.data.access_token);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (field) => ({
    ...styles.input,
    borderColor: inputFocus === field
      ? 'rgba(99,102,241,0.5)'
      : 'rgba(255,255,255,0.08)',
    boxShadow: inputFocus === field
      ? '0 0 0 3px rgba(99,102,241,0.1)'
      : 'none',
  });

  const getTabStyle = (t) => ({
    flex: 1,
    padding: '7px 0',
    border: 'none',
    borderRadius: 6,
    background: tab === t ? '#6366f1' : 'transparent',
    color: tab === t ? '#fff' : '#64748b',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: tab === t ? '0 0 16px rgba(99,102,241,0.3)' : 'none',
  });

  const getBtnStyle = () => ({
    ...styles.submitBtn,
    opacity: loading ? 0.65 : 1,
    cursor: loading ? 'default' : 'pointer',
    boxShadow: btnHover && !loading
      ? '0 0 24px rgba(99,102,241,0.4)'
      : '0 0 0 transparent',
  });

  return (
    <div style={styles.root}>
      {/* Ambient blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* Card */}
      <div style={styles.card}>
        {/* Top glow line */}
        <div style={styles.topGlow} />

        {/* Logo */}
        <div style={styles.logoSection}>
          <LogoIcon />
          <div style={styles.logoText}>Automation Builder</div>
          <div style={styles.logoSubtitle}>Visual workflow automation</div>
        </div>

        {/* Tabs */}
        <div style={styles.tabsWrapper}>
          {['login', 'register'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(''); }}
              style={getTabStyle(t)}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={getInputStyle('email')}
              onFocus={() => setInputFocus('email')}
              onBlur={() => setInputFocus(null)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === 'register' ? 'Min. 8 characters' : '••••••••'}
              required
              style={getInputStyle('password')}
              onFocus={() => setInputFocus('password')}
              onBlur={() => setInputFocus(null)}
            />
          </div>

          {error && (
            <div style={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={getBtnStyle()}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >
            {/* Shimmer overlay */}
            {btnHover && !loading && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                  animation: 'shimmer 0.6s ease forwards',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Spinner or label */}
            {loading ? (
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  verticalAlign: 'middle',
                }}
              />
            ) : (
              tab === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Bottom note */}
        <div style={styles.bottomNote}>Free forever — no credit card required</div>
      </div>
    </div>
  );
}
