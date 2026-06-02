import { NODE_CATALOG } from '../nodeTypes';
import { useStore } from '../store';
import { useState } from 'react';

export default function NodeSidebar() {
  const addNode = useStore(s => s.addNode);
  const [search, setSearch] = useState('');

  const filtered = NODE_CATALOG.map(cat => ({
    ...cat,
    nodes: cat.nodes.filter(n =>
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      cat.category.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.nodes.length > 0);

  return (
    <div style={{
      width: 220,
      background: '#13131f',
      borderRight: '1px solid #ffffff10',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      <div style={{ padding: '14px 12px 8px', borderBottom: '1px solid #ffffff10' }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>⚡ Nodes</div>
        <input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', background: '#1e1e2e', border: '1px solid #ffffff15',
            borderRadius: 6, padding: '5px 8px', color: '#f1f5f9', fontSize: 12,
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ padding: '8px 0', flex: 1 }}>
        {filtered.map(cat => (
          <div key={cat.category}>
            <div style={{ padding: '6px 12px 4px', fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              {cat.category}
            </div>
            {cat.nodes.map(node => (
              <div
                key={node.type}
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData('nodeType', node.type);
                  e.dataTransfer.setData('nodeMeta', JSON.stringify(node));
                }}
                onClick={() => addNode(node.type, node)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', cursor: 'pointer',
                  borderLeft: `3px solid transparent`,
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#ffffff08';
                  e.currentTarget.style.borderLeftColor = node.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderLeftColor = 'transparent';
                }}
              >
                <span style={{ fontSize: 14 }}>{node.icon}</span>
                <span style={{ fontSize: 12, color: '#cbd5e1' }}>{node.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
