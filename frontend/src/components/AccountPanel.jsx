import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

function planColor(plan) {
  if (plan === 'pro') return '#a855f7';
  if (plan === 'agency') return '#f59e0b';
  if (plan === 'solo') return '#6366f1';
  return '#64748b';
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AccountPanel({ user, onLogout }) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPw || !newPw) return;
    setSaving(true);
    setPwMsg(null);
    try {
      await axios.put(`${API}/auth/password`, { current_password: currentPw, new_password: newPw });
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPw('');
      setNewPw('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update password.' });
    } finally {
      setSaving(false);
    }
  };

  const plan = user?.plan || 'free';
  const initial = (user?.email || '?')[0].toUpperCase();

  const inputStyle = {
    width: '100%', background: '#1e1e2e', border: '1px solid #ffffff15',
    borderRadius: 6, padding: '7px 10px', color: '#f1f5f9', fontSize: 12,
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid #ffffff10', flexShrink: 0 }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>Account</div>
      </div>

      <div style={{ padding: '16px 12px', flex: 1 }}>
        {/* Avatar + info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10,
          }}>
            {initial}
          </div>
          <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 6, textAlign: 'center', wordBreak: 'break-all' }}>
            {user?.email}
          </div>
          <div style={{
            background: planColor(plan) + '22', border: `1px solid ${planColor(plan)}55`,
            color: planColor(plan), fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 10, textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {plan}
          </div>
          {user?.created_at && (
            <div style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>
              Member since {formatDate(user.created_at)}
            </div>
          )}
        </div>

        {/* Change password */}
        <div style={{ borderTop: '1px solid #ffffff08', paddingTop: 16 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Change Password
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              type="password"
              placeholder="Current password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input
              type="password"
              placeholder="New password (min. 8 chars)"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              style={inputStyle}
            />
          </div>
          {pwMsg && (
            <div style={{
              padding: '6px 10px', borderRadius: 5, fontSize: 11, marginBottom: 8,
              background: pwMsg.type === 'success' ? '#22c55e15' : '#ef444415',
              color: pwMsg.type === 'success' ? '#22c55e' : '#ef4444',
              border: `1px solid ${pwMsg.type === 'success' ? '#22c55e30' : '#ef444430'}`,
            }}>
              {pwMsg.text}
            </div>
          )}
          <button
            onClick={handlePasswordChange}
            disabled={saving || !currentPw || !newPw}
            style={{
              width: '100%', background: '#6366f1', border: 'none', borderRadius: 6,
              color: '#fff', fontSize: 12, fontWeight: 600, padding: '7px',
              cursor: saving || !currentPw || !newPw ? 'not-allowed' : 'pointer',
              opacity: saving || !currentPw || !newPw ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Update Password'}
          </button>
        </div>

        {/* Logout */}
        <div style={{ borderTop: '1px solid #ffffff08', paddingTop: 16, marginTop: 20 }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%', background: 'transparent', border: '1px solid #ef444455',
              borderRadius: 6, color: '#ef4444', fontSize: 12, fontWeight: 600,
              padding: '7px', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#ef444415'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
