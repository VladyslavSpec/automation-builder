import { useState, useEffect } from 'react';
import { useStore } from '../store';

const KEY_FIELDS = [
  { key: 'TG_TOKEN', label: 'Telegram Bot Token', placeholder: 'Bot token from @BotFather', type: 'password' },
  { key: 'YOUTUBE_API_KEY', label: 'YouTube API Key', placeholder: 'AIzaSy...', type: 'password' },
  { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', placeholder: 'sk-...', type: 'password' },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', placeholder: 'sk-ant-...', type: 'password' },
  { key: 'NOTION_API_KEY', label: 'Notion API Key', placeholder: 'secret_...', type: 'password' },
  { key: 'GOOGLE_SERVICE_ACCOUNT', label: 'Google Service Account JSON', placeholder: '{"type": "service_account", ...}', type: 'textarea' },
];

export default function SettingsPanel() {
  const apiKeys = useStore(s => s.apiKeys);
  const apiKeysLoaded = useStore(s => s.apiKeysLoaded);
  const apiKeysSaving = useStore(s => s.apiKeysSaving);
  const fetchApiKeys = useStore(s => s.fetchApiKeys);
  const saveApiKeys = useStore(s => s.saveApiKeys);

  const [localKeys, setLocalKeys] = useState({});
  const [visible, setVisible] = useState({});
  const [savedMsg, setSavedMsg] = useState(null);

  useEffect(() => {
    if (!apiKeysLoaded) fetchApiKeys();
  }, []);

  useEffect(() => {
    setLocalKeys(apiKeys);
  }, [apiKeys]);

  const handleSave = async () => {
    await saveApiKeys(localKeys);
    setSavedMsg('Saved');
    setTimeout(() => setSavedMsg(null), 2000);
  };

  const inputStyle = {
    width: '100%', background: '#1e1e2e', border: '1px solid #ffffff15',
    borderRadius: 6, padding: '6px 10px', color: '#f1f5f9', fontSize: 11,
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid #ffffff10', flexShrink: 0 }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>API Keys</div>
        <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>
          Stored securely per account
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {KEY_FIELDS.map(field => (
          <div key={field.key} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 500 }}>
              {field.label}
            </div>
            {field.type === 'textarea' ? (
              <textarea
                rows={3}
                placeholder={field.placeholder}
                value={localKeys[field.key] || ''}
                onChange={e => setLocalKeys(k => ({ ...k, [field.key]: e.target.value }))}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.4 }}
              />
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  type={visible[field.key] ? 'text' : 'password'}
                  placeholder={field.placeholder}
                  value={localKeys[field.key] || ''}
                  onChange={e => setLocalKeys(k => ({ ...k, [field.key]: e.target.value }))}
                  style={{ ...inputStyle, paddingRight: 30 }}
                />
                <button
                  onClick={() => setVisible(v => ({ ...v, [field.key]: !v[field.key] }))}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#475569', cursor: 'pointer',
                    fontSize: 12, padding: 0, lineHeight: 1,
                  }}
                  title={visible[field.key] ? 'Hide' : 'Show'}
                >
                  {visible[field.key] ? '🙈' : '👁'}
                </button>
              </div>
            )}
          </div>
        ))}

        <div style={{ padding: '8px 0 4px', fontSize: 10, color: '#475569', lineHeight: 1.5, borderTop: '1px solid #ffffff08', marginTop: 4, marginBottom: 12 }}>
          Use keys in node config as <code style={{ background: '#ffffff10', padding: '1px 4px', borderRadius: 3 }}>{'{{env.KEY_NAME}}'}</code>
        </div>

        <button
          onClick={handleSave}
          disabled={apiKeysSaving}
          style={{
            width: '100%', background: '#6366f1', border: 'none', borderRadius: 6,
            color: '#fff', fontSize: 12, fontWeight: 600, padding: '7px',
            cursor: apiKeysSaving ? 'not-allowed' : 'pointer',
            opacity: apiKeysSaving ? 0.6 : 1,
          }}
        >
          {apiKeysSaving ? 'Saving...' : savedMsg || 'Save Keys'}
        </button>
      </div>
    </div>
  );
}
