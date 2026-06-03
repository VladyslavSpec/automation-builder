import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { t } from '../i18n';

const API = import.meta.env.VITE_API_URL || '';

const PLAN_META = {
  free:   { label: 'Free',   color: '#475569' },
  solo:   { label: 'Solo',   color: '#6366f1' },
  pro:    { label: 'Pro',    color: '#8b5cf6' },
  agency: { label: 'Agency', color: '#d97706' },
};

const LOCALE_MAP = { en: 'en-US', ru: 'ru-RU', es: 'es-ES', de: 'de-DE' };

function formatDate(iso, lang = 'en') {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(LOCALE_MAP[lang] || 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function UsageBar({ used, max, label, unlimited = 'Unlimited' }) {
  const pct = max ? Math.min(100, (used / max) * 100) : 0;
  const warn = max && pct > 80;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
        <span style={{ fontSize: 11, color: warn ? '#f59e0b' : '#64748b' }}>
          {used}{max ? ` / ${max}` : ''}
        </span>
      </div>
      <div style={{ height: 3, background: '#1e2030', borderRadius: 2, overflow: 'hidden' }}>
        {max && (
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 2,
            background: warn ? '#f59e0b' : '#6366f1',
            transition: 'width 0.4s ease',
          }} />
        )}
        {!max && (
          <div style={{ height: '100%', width: '100%', background: '#6366f130', borderRadius: 2 }} />
        )}
      </div>
      {!max && <div style={{ fontSize: 10, color: '#334155', marginTop: 2 }}>{unlimited}</div>}
    </div>
  );
}

const inputStyle = {
  width: '100%', background: '#0f0f1a', border: '1px solid #ffffff12',
  borderRadius: 4, padding: '7px 10px', color: '#e2e8f0', fontSize: 12,
  outline: 'none', boxSizing: 'border-box',
};

export default function AccountPanel({ user, onLogout }) {
  const lang = useStore(s => s.lang);
  const [name, setName] = useState(user?.name || '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState(null);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

  const [usage, setUsage] = useState(null);

  useEffect(() => {
    axios.get(`${API}/auth/usage`)
      .then(r => setUsage(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => { setName(user?.name || ''); }, [user?.name]);

  const handleSaveName = async () => {
    setNameSaving(true);
    setNameMsg(null);
    try {
      await axios.patch(`${API}/auth/profile`, { name });
      setNameMsg({ ok: true, text: t('acc.saved', lang) });
    } catch {
      setNameMsg({ ok: false, text: t('acc.failed', lang) });
    } finally {
      setNameSaving(false);
      setTimeout(() => setNameMsg(null), 2000);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPw || !newPw) return;
    setPwSaving(true);
    setPwMsg(null);
    try {
      await axios.put(`${API}/auth/password`, { current_password: currentPw, new_password: newPw });
      setPwMsg({ ok: true, text: t('acc.pwUpdated', lang) });
      setCurrentPw(''); setNewPw('');
    } catch (err) {
      setPwMsg({ ok: false, text: err.response?.data?.detail || t('acc.failed', lang) });
    } finally {
      setPwSaving(false);
    }
  };

  const plan = user?.plan || 'free';
  const planMeta = PLAN_META[plan] || PLAN_META.free;
  const initial = (user?.email || '?')[0].toUpperCase();

  const msgStyle = (ok) => ({
    padding: '5px 8px', borderRadius: 4, fontSize: 11, marginBottom: 8,
    background: ok ? '#16a34a15' : '#ef444415',
    color: ok ? '#4ade80' : '#f87171',
    border: `1px solid ${ok ? '#16a34a30' : '#ef444430'}`,
  });

  const sectionLabel = {
    fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 10,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '13px 13px 10px', borderBottom: '1px solid #ffffff0d', flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.3 }}>{t('acc.title', lang)}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 13px' }}>

        {/* Avatar + identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: '#1e2030', border: '1px solid #ffffff15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: '#e2e8f0',
          }}>
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || user?.email || '—'}
            </div>
            <div style={{ fontSize: 10, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                color: planMeta.color, background: planMeta.color + '18',
                border: `1px solid ${planMeta.color}35`,
                padding: '1px 6px', borderRadius: 2,
              }}>
                {planMeta.label}
              </span>
            </div>
          </div>
        </div>

        {/* Plan usage */}
        {usage && (
          <div style={{ marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid #ffffff08' }}>
            <div style={sectionLabel}>{t('acc.thisMonth', lang)}</div>
            <UsageBar
              label={t('acc.executions', lang)}
              used={usage.executions_this_month}
              max={usage.limits?.runs}
              unlimited={t('acc.unlimited', lang)}
            />
            <UsageBar
              label={t('acc.workflows', lang)}
              used={usage.workflows_count}
              max={usage.limits?.workflows}
              unlimited={t('acc.unlimited', lang)}
            />
          </div>
        )}

        {/* Name */}
        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #ffffff08' }}>
          <div style={sectionLabel}>{t('acc.displayName', lang)}</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('acc.yourName', lang)}
            style={inputStyle}
          />
          {nameMsg && <div style={{ ...msgStyle(nameMsg.ok), marginTop: 6, marginBottom: 0 }}>{nameMsg.text}</div>}
          <button
            onClick={handleSaveName}
            disabled={nameSaving}
            style={{
              marginTop: 7, width: '100%', background: '#1e2030', border: '1px solid #ffffff15',
              borderRadius: 4, color: '#94a3b8', fontSize: 11, padding: '6px',
              cursor: nameSaving ? 'default' : 'pointer', opacity: nameSaving ? 0.6 : 1,
            }}
          >
            {nameSaving ? t('acc.saving', lang) : t('acc.saveName', lang)}
          </button>
        </div>

        {/* Email (read-only) */}
        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #ffffff08' }}>
          <div style={sectionLabel}>{t('acc.email', lang)}</div>
          <input value={user?.email || ''} readOnly style={{ ...inputStyle, color: '#475569', cursor: 'default' }} />
          {user?.created_at && (
            <div style={{ fontSize: 10, color: '#334155', marginTop: 5 }}>
              {t('acc.memberSince', lang)} {formatDate(user.created_at, lang)}
            </div>
          )}
        </div>

        {/* Change password */}
        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #ffffff08' }}>
          <div style={sectionLabel}>{t('acc.changePassword', lang)}</div>
          <input
            type="password" placeholder={t('acc.currentPw', lang)} value={currentPw}
            onChange={e => setCurrentPw(e.target.value)}
            style={{ ...inputStyle, marginBottom: 7 }}
          />
          <input
            type="password" placeholder={t('acc.newPw', lang)} value={newPw}
            onChange={e => setNewPw(e.target.value)}
            style={inputStyle}
          />
          {pwMsg && <div style={{ ...msgStyle(pwMsg.ok), marginTop: 6, marginBottom: 0 }}>{pwMsg.text}</div>}
          <button
            onClick={handlePasswordChange}
            disabled={pwSaving || !currentPw || !newPw}
            style={{
              marginTop: 7, width: '100%', background: '#1e2030', border: '1px solid #ffffff15',
              borderRadius: 4, color: '#94a3b8', fontSize: 11, padding: '6px',
              cursor: pwSaving || !currentPw || !newPw ? 'not-allowed' : 'pointer',
              opacity: pwSaving || !currentPw || !newPw ? 0.4 : 1,
            }}
          >
            {pwSaving ? t('acc.updating', lang) : t('acc.updatePw', lang)}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            width: '100%', background: 'transparent', border: '1px solid #ef444430',
            borderRadius: 4, color: '#ef4444', fontSize: 11, padding: '7px',
            cursor: 'pointer', letterSpacing: 0.2,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#ef444410'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {t('acc.signOut', lang)}
        </button>
      </div>
    </div>
  );
}
