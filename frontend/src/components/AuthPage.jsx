import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const input = {
    width: '100%', background: '#1e1e2e', border: '1px solid #ffffff20',
    borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0f0f1a',
    }}>
      <div style={{
        width: 380, background: '#13131f', borderRadius: 16,
        border: '1px solid #ffffff10', padding: '32px 28px',
        boxShadow: '0 24px 64px #00000060',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Automation Builder</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>No-code workflow automation</div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: '#1e1e2e', borderRadius: 8,
          padding: 4, marginBottom: 24, gap: 4,
        }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1, padding: '7px 0', border: 'none', borderRadius: 6,
                background: tab === t ? '#6366f1' : 'transparent',
                color: tab === t ? '#fff' : '#94a3b8',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={input}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#ffffff20'}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={tab === 'register' ? 'Min. 8 characters' : '••••••••'}
              required
              style={input}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#ffffff20'}
            />
          </div>

          {error && (
            <div style={{
              background: '#ef444420', border: '1px solid #ef444440',
              borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#ef4444',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4, padding: '11px', border: 'none', borderRadius: 8,
              background: loading ? '#4f46e5aa' : '#6366f1',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? '...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
