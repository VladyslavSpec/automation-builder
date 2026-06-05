import { useState, useEffect, useRef } from 'react';
import { NODE_CATALOG } from '../nodeTypes';
import { NodeIcon } from '../NodeIcons';
import { useStore } from '../store';

const ALL_NODES = NODE_CATALOG.flatMap(cat =>
  cat.nodes.map(n => ({ ...n, category: cat.category }))
);

export default function NodeSpotlight({ onClose }) {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const addNode = useStore(s => s.addNode);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = query.trim()
    ? ALL_NODES.filter(n =>
        n.label.toLowerCase().includes(query.toLowerCase()) ||
        n.category.toLowerCase().includes(query.toLowerCase()) ||
        n.type.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_NODES;

  useEffect(() => setHighlighted(0), [query]);

  const handleAdd = (node) => {
    addNode(node.type, node);
    onClose();
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted(h => Math.min(h + 1, filtered.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted(h => Math.max(h - 1, 0));
        return;
      }
      if (e.key === 'Enter' && filtered[highlighted]) {
        handleAdd(filtered[highlighted]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, highlighted, onClose]);

  useEffect(() => {
    const el = listRef.current?.children[highlighted];
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  // Group by category for display when no search query
  const grouped = !query.trim()
    ? NODE_CATALOG.map(cat => ({ ...cat, nodes: cat.nodes.map(n => ({ ...n, category: cat.category })) }))
    : null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 460, maxHeight: 540, background: '#0c0c1a',
          border: '1px solid rgba(99,102,241,0.22)',
          borderRadius: 14,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 100px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.04)',
          overflow: 'hidden',
          animation: 'spotlightIn 0.13s cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes spotlightIn {
            from { opacity: 0; transform: scale(0.94) translateY(-10px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Search */}
        <div style={{ padding: '14px 16px 10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#475569" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="7" cy="7" r="4.5"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14"/>
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search nodes..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#e2e8f0', fontSize: 14, fontFamily: 'inherit', letterSpacing: -0.1,
              }}
            />
            <kbd style={{
              background: '#111122', border: '1px solid #ffffff0d', borderRadius: 4,
              padding: '2px 7px', fontSize: 10, color: '#334155', fontFamily: 'monospace',
            }}>ESC</kbd>
          </div>
        </div>

        <div style={{ height: 1, background: '#ffffff0a', flexShrink: 0 }} />

        {/* Results */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.length === 0 && (
            <div style={{ padding: '28px', textAlign: 'center', color: '#334155', fontSize: 12 }}>
              No nodes match "{query}"
            </div>
          )}

          {/* Flat list when searching */}
          {query.trim() && (
            <div ref={listRef} style={{ padding: '6px 0 8px' }}>
              {filtered.map((node, i) => (
                <NodeRow key={node.type} node={node} highlighted={i === highlighted}
                  onAdd={() => handleAdd(node)}
                  onHover={() => setHighlighted(i)}
                />
              ))}
            </div>
          )}

          {/* Grouped when not searching */}
          {!query.trim() && grouped && (
            <div ref={listRef} style={{ padding: '4px 0 8px' }}>
              {grouped.map(cat => (
                <div key={cat.category}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px 3px',
                  }}>
                    <span style={{ fontSize: 9.5, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.9px' }}>
                      {cat.category}
                    </span>
                  </div>
                  {cat.nodes.map(node => {
                    const flatIdx = filtered.indexOf(node);
                    return (
                      <NodeRow key={node.type} node={node} highlighted={flatIdx === highlighted}
                        onAdd={() => handleAdd(node)}
                        onHover={() => setHighlighted(flatIdx)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div style={{
          padding: '8px 16px', borderTop: '1px solid #ffffff08',
          display: 'flex', gap: 14, flexShrink: 0,
        }}>
          {[['↵','Add'],['↑↓','Navigate'],['Space','Open'],['Esc','Close']].map(([key, label]) => (
            <span key={key} style={{ fontSize: 10, color: '#253040', display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{
                background: '#111122', border: '1px solid #ffffff08', borderRadius: 3,
                padding: '1px 5px', fontSize: 9, color: '#334155', fontFamily: 'monospace',
              }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function NodeRow({ node, highlighted, onAdd, onHover }) {
  return (
    <div
      onClick={onAdd}
      onMouseEnter={onHover}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '7px 16px',
        background: highlighted ? '#ffffff08' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.08s',
        borderLeft: `2px solid ${highlighted ? node.color + '70' : 'transparent'}`,
      }}
    >
      <div style={{
        width: 30, height: 30, flexShrink: 0,
        background: `${node.color}18`,
        border: `1px solid ${node.color}${highlighted ? '45' : '22'}`,
        borderRadius: 7,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.1s',
      }}>
        <NodeIcon type={node.type} size={14} color={node.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
          color: highlighted ? '#e2e8f0' : '#94a3b8',
          transition: 'color 0.08s',
        }}>{node.label}</div>
        <div style={{ fontSize: 9.5, color: '#334155', marginTop: 1 }}>{node.category}</div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onAdd(); }}
        style={{
          width: 26, height: 26, borderRadius: 7, border: 'none',
          background: highlighted ? `${node.color}20` : 'transparent',
          color: highlighted ? node.color : '#334155',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, lineHeight: 1, transition: 'all 0.1s', flexShrink: 0,
        }}
      >+</button>
    </div>
  );
}
