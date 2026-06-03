import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { t } from '../i18n';

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
  const lang = useStore(s => s.lang);
  const setLang = useStore(s => s.setLang);

  const HOTKEYS = [
    { group: t('hk.group.workflow', lang), items: [
      { keys: ['Ctrl', 'S'],      label: t('hk.save', lang) },
      { keys: ['Ctrl', '↵'],      label: t('hk.run', lang) },
      { keys: ['Ctrl', 'N'],      label: t('hk.new', lang) },
    ]},
    { group: t('hk.group.edit', lang), items: [
      { keys: ['Ctrl', 'Z'],      label: t('hk.undo', lang) },
      { keys: ['Ctrl', 'Y'],      label: t('hk.redo', lang) },
      { keys: ['Ctrl', 'A'],      label: t('hk.selectAll', lang) },
      { keys: ['Ctrl', 'C'],      label: t('hk.copy', lang) },
      { keys: ['Ctrl', 'V'],      label: t('hk.paste', lang) },
      { keys: ['Ctrl', 'D'],      label: t('hk.duplicate', lang) },
      { keys: ['Del'],            label: t('hk.delete', lang) },
    ]},
    { group: t('hk.group.view', lang), items: [
      { keys: ['Ctrl', '⇧', 'H'], label: t('hk.center', lang) },
      { keys: ['Scroll'],         label: t('hk.scroll', lang) },
      { keys: ['Space', 'drag'],  label: t('hk.pan', lang) },
    ]},
    { group: t('hk.group.panel', lang), items: [
      { keys: ['Esc'],            label: t('hk.close', lang) },
    ]},
  ];
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
    setLang(prefs.language);
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

  const tabBtn = (id) => ({
    flex: 1, background: tab === id ? '#ffffff0a' : 'transparent',
    border: 'none', borderBottom: `1px solid ${tab === id ? '#6366f1' : 'transparent'}`,
    color: tab === id ? '#e2e8f0' : '#475569',
    fontSize: 11, fontWeight: 500, padding: '8px 0', cursor: 'pointer',
    letterSpacing: 0.2, transition: 'all 0.1s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '13px 13px 0', borderBottom: '1px solid #ffffff0d', flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.3, marginBottom: 8 }}>{t('settings.title', lang)}</div>
        <div style={{ display: 'flex', gap: 0 }}>
          <button style={tabBtn('general')}      onClick={() => setTab('general')}>{t('settings.general', lang)}</button>
          <button style={tabBtn('integrations')} onClick={() => setTab('integrations')}>{t('settings.integrations', lang)}</button>
          <button style={tabBtn('hotkeys')}      onClick={() => setTab('hotkeys')}>{t('settings.hotkeys', lang)}</button>
        </div>
      </div>

      {/* General tab */}
      {tab === 'general' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 13px' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={sectionLabel}>{t('settings.language', lang)}</div>
            <select
              value={prefs.language}
              onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}
              style={selectStyle}
            >
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={sectionLabel}>{t('settings.timezone', lang)}</div>
            <select
              value={prefs.timezone}
              onChange={e => setPrefs(p => ({ ...p, timezone: e.target.value }))}
              style={selectStyle}
            >
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={sectionLabel}>{t('settings.dateFormat', lang)}</div>
            <select
              value={prefs.dateFormat}
              onChange={e => setPrefs(p => ({ ...p, dateFormat: e.target.value }))}
              style={selectStyle}
            >
              {DATE_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #ffffff08' }}>
            <div style={sectionLabel}>{t('settings.interface', lang)}</div>
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
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{t('settings.compact', lang)}</span>
            </label>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={sectionLabel}>{t('settings.theme', lang)}</div>
            <div style={{
              background: '#0f0f1a', border: '1px solid #ffffff12', borderRadius: 4,
              padding: '7px 10px', fontSize: 11, color: '#475569', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{t('settings.dark', lang)}</span>
              <span style={{ fontSize: 10, color: '#334155' }}>{t('settings.themeOnly', lang)}</span>
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
            {prefsSaved ? t('settings.saved', lang) : t('settings.save', lang)}
          </button>
        </div>
      )}

      {/* Hotkeys tab */}
      {tab === 'hotkeys' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 13px' }}>
          {HOTKEYS.map(({ group, items }) => (
            <div key={group} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                {group}
              </div>
              {items.map(({ keys, label }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#475569' }}>{label}</span>
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    {keys.map((k, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <kbd style={{
                          background: '#0f0f1a', border: '1px solid #ffffff0d', borderRadius: 3,
                          padding: '2px 6px', fontSize: 9, color: '#6366f1', fontFamily: 'monospace',
                          letterSpacing: 0, lineHeight: 1.4, display: 'inline-block',
                        }}>
                          {k}
                        </kbd>
                        {i < keys.length - 1 && <span style={{ fontSize: 9, color: '#1e2030' }}>+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ fontSize: 10, color: '#334155', paddingTop: 8, borderTop: '1px solid #ffffff06', lineHeight: 1.6 }}>
            {t('hk.note', lang)}
          </div>
        </div>
      )}

      {/* Integrations tab */}
      {tab === 'integrations' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 13px' }}>
          {!apiLoaded && (
            <div style={{ fontSize: 11, color: '#334155', textAlign: 'center', padding: 16 }}>{t('settings.loading', lang)}</div>
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
                {t('settings.envHint', lang)}{' '}
                <code style={{ background: '#ffffff08', padding: '1px 4px', borderRadius: 2, fontFamily: 'monospace' }}>{'{{env.KEY_NAME}}'}</code>
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
                {apiSaving ? t('settings.saving', lang) : apiSaved ? t('settings.keysSaved', lang) : t('settings.saveKeys', lang)}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
