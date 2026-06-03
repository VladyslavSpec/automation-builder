import { NODE_CATALOG } from '../nodeTypes';
import { useStore } from '../store';
import { NodeIcon } from '../NodeIcons';
import { useState } from 'react';
import { t } from '../i18n';

const CATEGORY_ICONS = {
  'Triggers': { color: '#6366f1', dot: '#6366f1' },
  'YouTube':  { color: '#ef4444', dot: '#ef4444' },
  'Telegram': { color: '#0ea5e9', dot: '#0ea5e9' },
  'AI':       { color: '#a855f7', dot: '#a855f7' },
  'Twitter / X': { color: '#e2e8f0', dot: '#94a3b8' },
  'Notion':   { color: '#f59e0b', dot: '#f59e0b' },
  'Google Sheets': { color: '#22c55e', dot: '#22c55e' },
  'Logic':    { color: '#64748b', dot: '#64748b' },
};

export default function NodeSidebarPanel() {
  const addNode = useStore(s => s.addNode);
  const lang = useStore(s => s.lang);
  const [search, setSearch] = useState('');

  const filtered = NODE_CATALOG.map(cat => ({
    ...cat,
    nodes: cat.nodes.filter(n =>
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      cat.category.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.nodes.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #ffffff0a', flexShrink: 0 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#475569',
          letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8,
        }}>{t('nodes.library', lang)}</div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg
            width="12" height="12" viewBox="0 0 16 16" fill="none"
            stroke="#475569" strokeWidth="1.5" strokeLinecap="round"
            style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="7" cy="7" r="4.5"/>
            <line x1="10.5" y1="10.5" x2="14" y2="14"/>
          </svg>
          <input
            placeholder={t('nodes.search', lang)}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', background: '#0d0d1a', border: '1px solid #ffffff10',
              borderRadius: 6, padding: '5px 8px 5px 26px',
              color: '#e2e8f0', fontSize: 11, outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#6366f150'}
            onBlur={e => e.target.style.borderColor = '#ffffff10'}
          />
        </div>
      </div>

      {/* Node list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0 12px' }}>
        {filtered.map(cat => {
          const catMeta = CATEGORY_ICONS[cat.category] || { color: '#64748b', dot: '#64748b' };
          return (
            <div key={cat.category} style={{ marginBottom: 2 }}>
              {/* Category header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px 4px',
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: catMeta.dot, flexShrink: 0,
                  boxShadow: `0 0 4px ${catMeta.dot}80`,
                }}/>
                <span style={{
                  fontSize: 9.5, color: '#475569', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.9px',
                }}>
                  {cat.category}
                </span>
              </div>

              {/* Nodes */}
              {cat.nodes.map(node => (
                <NodeItem key={node.type} node={node} onAdd={addNode} />
              ))}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: '#334155', fontSize: 11 }}>
            No nodes match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

function NodeItem({ node, onAdd }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('nodeType', node.type);
        e.dataTransfer.setData('nodeMeta', JSON.stringify(node));
      }}
      onClick={() => onAdd(node.type, node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '5px 12px',
        cursor: 'grab',
        background: hovered ? '#ffffff07' : 'transparent',
        borderLeft: `2px solid ${hovered ? node.color + '60' : 'transparent'}`,
        transition: 'background 0.1s, border-color 0.1s',
        userSelect: 'none',
      }}
    >
      {/* Icon container */}
      <div style={{
        width: 26, height: 26, flexShrink: 0,
        background: `${node.color}18`,
        border: `1px solid ${node.color}${hovered ? '40' : '20'}`,
        borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.1s, box-shadow 0.1s',
        boxShadow: hovered ? `0 0 8px ${node.color}25` : 'none',
      }}>
        <NodeIcon type={node.type} size={12} color={node.color}/>
      </div>

      <span style={{
        fontSize: 11.5, color: hovered ? '#e2e8f0' : '#94a3b8',
        transition: 'color 0.1s', letterSpacing: 0.1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {node.label}
      </span>
    </div>
  );
}
