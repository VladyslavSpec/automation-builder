import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

const SUGGESTIONS = [
  'How do I post to Telegram when a new YouTube video is published?',
  'What does my current workflow do?',
  'How do I use template variables like {{trigger.field}}?',
  'What nodes can I use to process data before sending?',
];

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: '#6366f1', opacity: 0.5,
          animation: `thinking-dot 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
      <style>{`
        @keyframes thinking-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default function ClaudeChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    } catch {
      setMessages([...updated, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 76, right: 20, width: 360, height: 500,
          background: '#0d0d1a',
          border: '1px solid rgba(99,102,241,0.18)',
          borderRadius: 14,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 12px 48px rgba(0,0,0,0.75), 0 0 0 1px rgba(99,102,241,0.06)',
          zIndex: 9999,
          animation: 'chatSlideUp 0.18s ease',
        }}>
          <style>{`
            @keyframes chatSlideUp {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            padding: '11px 14px', borderBottom: '1px solid #ffffff0d',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
            borderRadius: '14px 14px 0 0',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 14px rgba(99,102,241,0.45)',
              fontSize: 14, color: '#fff',
            }}>✦</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', letterSpacing: -0.1 }}>AI Assistant</div>
              <div style={{ fontSize: 10, color: '#334155' }}>Powered by Claude · knows your workflow</div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                style={{
                  background: 'none', border: 'none', color: '#334155',
                  cursor: 'pointer', fontSize: 10, padding: '2px 6px',
                  borderRadius: 3, letterSpacing: 0.2, fontFamily: 'inherit',
                  transition: 'color 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#64748b'}
                onMouseLeave={e => e.currentTarget.style.color = '#334155'}
              >Clear</button>
            )}
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', color: '#334155',
                cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px',
                transition: 'color 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
              onMouseLeave={e => e.currentTarget.style.color = '#334155'}
            >×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && (
              <>
                <div style={{ fontSize: 11, color: '#334155', textAlign: 'center', marginBottom: 6 }}>
                  Ask me anything — I can see your current workflow
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s)}
                      style={{
                        background: '#0b0b18', border: '1px solid #ffffff08',
                        borderRadius: 8, padding: '8px 12px',
                        color: '#475569', fontSize: 11, textAlign: 'left',
                        cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.5,
                        transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
                        e.currentTarget.style.color = '#94a3b8';
                        e.currentTarget.style.background = '#0e0e1c';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#ffffff08';
                        e.currentTarget.style.color = '#475569';
                        e.currentTarget.style.background = '#0b0b18';
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '86%',
                  padding: '8px 12px',
                  borderRadius: msg.role === 'user'
                    ? '11px 11px 3px 11px'
                    : '11px 11px 11px 3px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #5457e8, #7c3aed)'
                    : '#111122',
                  border: msg.role === 'user' ? 'none' : '1px solid #ffffff0d',
                  color: '#dde3ee',
                  fontSize: 12,
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  letterSpacing: 0.1,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '8px 14px', borderRadius: '11px 11px 11px 3px',
                  background: '#111122', border: '1px solid #ffffff0d',
                }}>
                  <ThinkingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px 12px', borderTop: '1px solid #ffffff0d', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask Claude about your workflow..."
                rows={1}
                style={{
                  flex: 1, background: '#08080f',
                  border: '1px solid #ffffff0d',
                  borderRadius: 9, padding: '7px 10px',
                  color: '#e2e8f0', fontSize: 12,
                  resize: 'none', outline: 'none',
                  fontFamily: 'inherit', lineHeight: 1.5,
                  maxHeight: 90, overflow: 'auto',
                  transition: 'border-color 0.1s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                onBlur={e => e.target.style.borderColor = '#ffffff0d'}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  width: 34, height: 34, borderRadius: 9, border: 'none',
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                    : '#13131f',
                  color: input.trim() && !loading ? '#fff' : '#253040',
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s',
                  boxShadow: input.trim() && !loading ? '0 0 14px rgba(99,102,241,0.35)' : 'none',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1 6.5h11M6.5 1l5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div style={{ fontSize: 9, color: '#1a2030', marginTop: 5, textAlign: 'right' }}>
              Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        title={open ? 'Close AI Assistant' : 'Open AI Assistant (Claude)'}
        style={{
          position: 'fixed', bottom: 20, right: 20,
          width: 50, height: 50, borderRadius: 14, border: 'none',
          background: open
            ? '#111120'
            : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
          color: '#fff', cursor: 'pointer',
          boxShadow: open
            ? '0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15)'
            : '0 4px 24px rgba(99,102,241,0.55), 0 0 0 1px rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          zIndex: 9998, fontSize: 20,
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.transform = 'scale(1.08) translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; }}
      >
        {open
          ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          : <span style={{ fontSize: 18, lineHeight: 1 }}>✦</span>
        }
      </button>
    </>
  );
}
