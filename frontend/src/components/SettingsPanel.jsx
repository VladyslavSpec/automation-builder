import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

const PREFS_KEY = 'ab_preferences';

const defaultPrefs = {
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MMM DD, YYYY',
  compactMode: false,
};

function loadPrefs() {
  try { return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; }
  catch { return defaultPrefs; }
}

const API_KEY_FIELDS = [
  { key: 'TG_TOKEN',            label: 'Telegram Bot Token',  placeholder: 'Bot token from @BotFather' },
  { key: 'YOUTUBE_API_KEY',     label: 'YouTube API Key',     placeholder: 'AIzaSy...' },
  { key: 'OPENAI_API_KEY',      label: 'OpenAI API Key',      placeholder: 'sk-...' },
  { key: 'ANTHROPIC_API_KEY',   label: 'Anthropic API Key',   placeholder: 'sk-ant-...' },
  { key: 'NOTION_API_KEY',      label: 'Notion API Key',      placeholder: 'secret_...' },
  { key: 'GOOGLE_SERVICE_ACCOUNT', label: 'Google Service Account JSON', placeholder: '{"type":"service_account"...}', multi: true },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
];

const TIMEZONES = ['UTC','UTC-8','UTC-5','UTC-3','UTC+1','UTC+2','UTC+3','UTC+5','UTC+8','UTC+9'];

const DATE_FORMATS = [
  { value: 'MMM DD, YYYY', label: 'Jan 15, 2025' },
  { value: 'MM/DD/YYYY',   label: '01/15/2025' },
  { value: 'DD/MM/YYYY',   label: '15/01/2025' },
  { value: 'YYYY-MM-DD',   label: '2025-01-15' },
];

const inputStyle = {
  width: '100%', background: '#0f0f1a', border: '1px solid #ffffff12',
  borderRadius: 4, padding: '7px 10px', color: '#e2e8f0', fontSize: 11,
  outline: 'none', boxSizing: 'border-box',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none', cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23475569' strokeWidth='1.5' strokeLinecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  paddingRight: 28,
};

const sectionLabel = {
  fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: 0.8, marginBottom: 10,
};

export default function SettingsPanel() {
  const [tab, setTab] = useState('general');
  const [prefs, setPrefs] = useState(loadPrefs);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const [apiKeys, setApiKeys] = useState({});
  const [apiLoaded, setApiLoaded] = useState(false);
  const [apiSaving, setApiSaving] = useState(false);
  const [apiSaved, setApiSaved] = useState(false);
  const [visible, setVisible] = useState({});

  useEffect(() => {
    axios.get(`${API}/auth/settings`)
      .then(r => { setApiKeys(r.data.api_keys || {}); setApiLoaded(true); })
      .catch(() => setApiLoaded(true));
  }, []);

  const savePrefs = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2000);
  };

  const saveApiKeys = async () => {
    setApiSaving(true);
    try {
      await axios.put(`${API}/auth/settings`, { api_keys: apiKeys });
      setApiSaved(true);
      setTimeout(() => setApiSaved(false), 2000);
    } finally {
      setApiSaving(false);
    }
  };

  const tabBtn = (id, label) => ({
    flex: 1, background: tab === id ? '#ffffff0a' : 'transparent',
    border: 'none', borderBottom: `1px solid ${tab === id ? '#6366f1' : 'transparent'}`,
    color: tab === id ? '#e2e8f0' : '#475569',
    fontSize: 11, fontWeight: 500, padding: '8px 0', cursor: 'pointer',
    letterSpacing: 0.2, transition: 'all 0.1s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '13px 13px 0', borderBottom: '1px solid #ffffff0d', flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.3, marginBottom: 8 }}>Settings</div>
        <div style={{ display: 'flex', gap: 0 }}>
          <button style={tabBtn('general', 'General')} onClick={() => setTab('general')}>General</button>
          <button style={tabBtn('integrations', 'Integrations')} onClick={() => setTab('integrations')}>Integrations</button>
        </div>
      </div>

      {/* General tab */}
      {tab === 'general' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 13px' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={sectionLabel}>Language</div>
            <select
              value={prefs.language}
              onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}
              style={selectStyle}
            >
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <div style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>
              Full translation coming soon
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={sectionLabel}>Timezone</div>
            <select
              value={prefs.timezone}
              onChange={e => setPrefs(p => ({ ...p, timezone: e.target.value }))}
              style={selectStyle}
            >
              {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={sectionLabel}>Date Format</div>
            <select
              value={prefs.dateFormat}
              onChange={e => setPrefs(p => ({ ...p, dateFormat: e.target.value }))}
              style={selectStyle}
            >
              {DATE_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #ffffff08' }}>
            <div style={sectionLabel}>Interface</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div
                onClick={() => setPrefs(p => ({ ...p, compactMode: !p.compactMode }))}
                style={{
                  width: 32, height: 18, borderRadius: 9,
                  background: prefs.compactMode ? '#6366f1' : '#1e2030',
                  border: `1px solid ${prefs.compactMode ? '#6366f1' : '#ffffff15'}`,
                  position: 'relative', transition: 'background 0.15s', flexShrink: 0, cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 12, height: 12, borderRadius: '50%', background: '#e2e8f0',
                  position: 'absolute', top: 2,
                  left: prefs.compactMode ? 16 : 2,
                  transition: 'left 0.15s',
                }} />
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Compact mode</span>
            </label>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={sectionLabel}>Theme</div>
            <div style={{
              background: '#0f0f1a', border: '1px solid #ffffff12', borderRadius: 4,
              padding: '7px 10px', fontSize: 11, color: '#475569', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>Dark</span>
              <span style={{ fontSize: 10, color: '#334155' }}>Only option</span>
            </div>
          </div>

          <button
            onClick={savePrefs}
            style={{
              width: '100%', background: prefsSaved ? '#16a34a20' : '#1e2030',
              border: `1px solid ${prefsSaved ? '#16a34a40' : '#ffffff15'}`,
              borderRadius: 4, color: prefsSaved ? '#4ade80' : '#94a3b8',
              fontSize: 11, padding: '7px', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {prefsSaved ? 'Preferences saved' : 'Save Preferences'}
          </button>
        </div>
      )}

      {/* Integrations tab */}
      {tab === 'integrations' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 13px' }}>
          {!apiLoaded && (
            <div style={{ fontSize: 11, color: '#334155', textAlign: 'center', padding: 16 }}>Loading...</div>
          )}

          {apiLoaded && API_KEY_FIELDS.map(field => (
            <div key={field.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{field.label}</div>
              {field.multi ? (
                <textarea
                  rows={3}
                  placeholder={field.placeholder}
                  value={apiKeys[field.key] || ''}
                  onChange={e => setApiKeys(k => ({ ...k, [field.key]: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.4 }}
                />
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    type={visible[field.key] ? 'text' : 'password'}
                    placeholder={field.placeholder}
                    value={apiKeys[field.key] || ''}
                    onChange={e => setApiKeys(k => ({ ...k, [field.key]: e.target.value }))}
                    style={{ ...inputStyle, paddingRight: 28 }}
                  />
                  <button
                    onClick={() => setVisible(v => ({ ...v, [field.key]: !v[field.key] }))}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#334155',
                      cursor: 'pointer', fontSize: 11, padding: 0,
                    }}
                  >
                    {visible[field.key] ? '◎' : '○'}
                  </button>
                </div>
              )}
            </div>
          ))}

          {apiLoaded && (
            <>
              <div style={{ fontSize: 10, color: '#334155', marginBottom: 12, lineHeight: 1.5 }}>
                Use in nodes as <code style={{ background: '#ffffff08', padding: '1px 4px', borderRadius: 2, fontFamily: 'monospace' }}>{'{{env.KEY_NAME}}'}</code>
              </div>
              <button
                onClick={saveApiKeys}
                disabled={apiSaving}
                style={{
                  width: '100%', background: apiSaved ? '#16a34a20' : '#1e2030',
                  border: `1px solid ${apiSaved ? '#16a34a40' : '#ffffff15'}`,
                  borderRadius: 4, color: apiSaved ? '#4ade80' : '#94a3b8',
                  fontSize: 11, padding: '7px', cursor: apiSaving ? 'default' : 'pointer',
                  opacity: apiSaving ? 0.6 : 1, transition: 'all 0.15s',
                }}
              >
                {apiSaving ? 'Saving...' : apiSaved ? 'Keys saved' : 'Save Keys'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
