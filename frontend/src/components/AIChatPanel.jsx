import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import axios from 'axios';

function LimitBanner({ onGoToSettings }) {
  return (
    <div style={{
      margin: '4px 0', padding: '10px 12px',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(124,58,237,0.06))',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#818cf8', marginBottom: 4 }}>
        Daily limit reached
      </div>
      <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.6, marginBottom: 8 }}>
        Free plan includes 10 AI messages/day using shared credits. Add your own Anthropic API key for unlimited access.
      </div>
      <button
        onClick={onGoToSettings}
        style={{
          background: 'linear-gradient(135deg,#6366f1,#7c3aed)', border: 'none',
          borderRadius: 6, padding: '5px 12px', color: '#fff',
          fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 0 10px rgba(99,102,241,0.3)',
        }}
      >
        Add API key in Settings →
      </button>
    </div>
  );
}

const API = import.meta.env.VITE_API_URL || '';

const SUGGESTIONS = [
  'What does my current workflow do?',
  'How do I post to Telegram when a new YouTube video comes out?',
  'Explain {{trigger.field}} template syntax',
  'What node should I use to filter data?',
];

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', padding: '1px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 4, height: 4, borderRadius: '50%', background: '#6366f1', opacity: 0.5,
          animation: `td 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
      <style>{`@keyframes td{0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:.8}}`}</style>
    </div>
  );
}

export default function AIChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitHit, setLimitHit] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null); // {used, limit, ownKey}
  const bottomRef = useRef(null);
  const setActivePanel = useStore(s => s.setActiveSidebarPanel);
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const buildContext = () => {
    if (nodes.length === 0) return null;
    const nodeList = nodes.map(n => `  - ${n.data.label} (${n.data.nodeType})`).join('\n');
    const connList = edges.map(e => {
      const from = nodes.find(n => n.id === e.source)?.data.label || e.source;
      const to = nodes.find(n => n.id === e.target)?.data.label || e.target;
      return `  ${from} → ${to}`;
    }).join('\n');
    return `Nodes:\n${nodeList}${connList ? `\n\nConnections:\n${connList}` : ''}`;
  };

  const send = async (override) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    setInput('');
    const updated = [...messages, { role: 'user', content: text }];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chat/`, {
        messages: updated,
        workflow_context: buildContext(),
      });
      setMessages([...updated, { role: 'assistant', content: res.data.content }]);
      if (!res.data.used_own_key) {
        setUsageInfo({ used: res.data.messages_used, limit: res.data.messages_limit });
      } else {
        setUsageInfo({ ownKey: true });
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setLimitHit(true);
        setMessages([...updated]);
      } else {
        setMessages([...updated, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '11px 12px 8px', borderBottom: '1px solid #ffffff0a', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: '#fff', flexShrink: 0,
            boxShadow: '0 0 10px rgba(99,102,241,0.4)',
          }}>✦</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>AI Assistant</div>
            <div style={{ fontSize: 9, color: '#334155' }}>Powered by Claude</div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              style={{
                background: 'none', border: 'none', color: '#334155',
                cursor: 'pointer', fontSize: 10, padding: '2px 5px',
                borderRadius: 3, fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#64748b'}
              onMouseLeave={e => e.currentTarget.style.color = '#334155'}
            >Clear</button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <>
            <div style={{ fontSize: 10, color: '#334155', textAlign: 'center', marginBottom: 2 }}>
              Ask about your workflow
            </div>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{
                background: '#0b0b18', border: '1px solid #ffffff08', borderRadius: 7,
                padding: '7px 9px', color: '#475569', fontSize: 10, textAlign: 'left',
                cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.5,
                transition: 'all 0.1s', width: '100%',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.2)'; e.currentTarget.style.color='#94a3b8'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#ffffff08'; e.currentTarget.style.color='#475569'; }}
              >{s}</button>
            ))}
          </>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '88%', padding: '7px 10px',
              borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
              background: msg.role === 'user' ? 'linear-gradient(135deg,#5457e8,#7c3aed)' : '#111122',
              border: msg.role === 'user' ? 'none' : '1px solid #ffffff0d',
              color: '#dde3ee', fontSize: 11, lineHeight: 1.65,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '8px 12px', borderRadius: '10px 10px 10px 2px', background: '#111122', border: '1px solid #ffffff0d' }}>
              <ThinkingDots />
            </div>
          </div>
        )}
        {limitHit && (
          <LimitBanner onGoToSettings={() => setActivePanel('settings')} />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Usage counter (only when using server key) */}
      {usageInfo && !usageInfo.ownKey && !limitHit && (
        <div style={{
          padding: '4px 10px', borderTop: '1px solid #ffffff06',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 9, color: '#253040' }}>
            Free: {usageInfo.used}/{usageInfo.limit} today
          </span>
          <button
            onClick={() => setActivePanel('settings')}
            style={{
              background: 'none', border: 'none', fontSize: 9, color: '#334155',
              cursor: 'pointer', fontFamily: 'inherit', padding: '1px 4px', borderRadius: 3,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
            onMouseLeave={e => e.currentTarget.style.color = '#334155'}
          >Add own key →</button>
        </div>
      )}
      {usageInfo?.ownKey && (
        <div style={{ padding: '4px 10px', borderTop: '1px solid #ffffff06', flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: '#253040' }}>✓ Using your own API key · Unlimited</span>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '8px 10px 10px', borderTop: '1px solid #ffffff0a', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => !limitHit && setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={limitHit ? 'Daily limit reached — add your API key' : 'Ask Claude...'}
            disabled={limitHit}
            rows={2}
            style={{
              flex: 1, background: '#08080f', border: '1px solid #ffffff0d',
              borderRadius: 8, padding: '6px 8px', color: '#e2e8f0',
              fontSize: 11, resize: 'none', outline: 'none',
              fontFamily: 'inherit', lineHeight: 1.5,
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
            onBlur={e => e.target.style.borderColor = '#ffffff0d'}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none',
              background: input.trim() && !loading ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#13131f',
              color: input.trim() && !loading ? '#fff' : '#253040',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.15s',
              boxShadow: input.trim() && !loading ? '0 0 10px rgba(99,102,241,0.3)' : 'none',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 5.5h9M5.5 1l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div style={{ fontSize: 9, color: '#1a2030', marginTop: 4, textAlign: 'right' }}>↵ Send · ⇧↵ New line</div>
      </div>
    </div>
  );
}
