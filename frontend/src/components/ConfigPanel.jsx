import { useState } from 'react';
import { useStore } from '../store';
import { NODE_MAP } from '../nodeTypes';

export default function ConfigPanel() {
  const configPanelNode = useStore(s => s.configPanelNode);
  const closeConfig = useStore(s => s.closeConfig);
  const updateNodeConfig = useStore(s => s.updateNodeConfig);
  const deleteNode = useStore(s => s.deleteNode);
  const nodes = useStore(s => s.nodes);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!configPanelNode) return null;

  const liveNode = nodes.find(n => n.id === configPanelNode.id);
  const data = liveNode?.data || configPanelNode.data;
  const catalog = NODE_MAP[data.nodeType] || {};
  const fields = catalog.fields || data.fields || [];

  const handleDelete = () => {
    deleteNode(configPanelNode.id);
    setConfirmDelete(false);
  };

  return (
    <div style={{
      width: 300,
      background: '#0d0d1a',
      borderLeft: '1px solid #ffffff0d',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid #ffffff0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{data.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: data.color, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {data.nodeType}
            </div>
            <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {data.label}
            </div>
          </div>
        </div>
        <button
          onClick={closeConfig}
          style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.color = '#334155'}
        >
          ×
        </button>
      </div>

      {/* Node ID */}
      <div style={{ padding: '5px 12px', background: '#080810', borderBottom: '1px solid #ffffff0d' }}>
        <span style={{ fontSize: 10, color: '#334155' }}>ID: </span>
        <span style={{ fontSize: 10, color: '#6366f1', fontFamily: 'monospace' }}>{configPanelNode.id}</span>
        <span style={{ fontSize: 10, color: '#334155', marginLeft: 6 }}>→ </span>
        <span style={{ fontSize: 10, color: '#8b5cf6', fontFamily: 'monospace' }}>{'{{' + configPanelNode.id + '.field}}'}</span>
      </div>

      {/* Fields */}
      <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
        {fields.length === 0 && (
          <div style={{ color: '#334155', fontSize: 11 }}>No configuration needed.</div>
        )}
        {fields.map(field => (
          <div key={field.key} style={{ marginBottom: 13 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {field.label}
            </label>
            {field.textarea ? (
              <textarea
                rows={3}
                value={data.config?.[field.key] || ''}
                onChange={e => updateNodeConfig(configPanelNode.id, field.key, e.target.value)}
                placeholder={field.placeholder}
                style={inputStyle}
              />
            ) : (
              <input
                value={data.config?.[field.key] || ''}
                onChange={e => updateNodeConfig(configPanelNode.id, field.key, e.target.value)}
                placeholder={field.placeholder}
                style={inputStyle}
              />
            )}
          </div>
        ))}
      </div>

      {/* Template hint */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #ffffff0d', background: '#080810' }}>
        <div style={{ fontSize: 10, color: '#334155', lineHeight: 1.6 }}>
          <code style={{ color: '#6366f155', fontFamily: 'monospace' }}>{'{{trigger.field}}'}</code>
          <span style={{ marginLeft: 6 }}>trigger data</span><br />
          <code style={{ color: '#6366f155', fontFamily: 'monospace' }}>{'{{nodeId.field}}'}</code>
          <span style={{ marginLeft: 6 }}>node output</span>
        </div>
      </div>

      {/* Delete node */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #ffffff0d' }}>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              width: '100%', background: 'transparent', border: '1px solid #ef444425',
              borderRadius: 4, color: '#ef4444', fontSize: 11, padding: '6px',
              cursor: 'pointer', letterSpacing: 0.2,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#ef444410'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Delete node
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleDelete}
              style={{
                flex: 1, background: '#ef4444', border: 'none', borderRadius: 4,
                color: '#fff', fontSize: 11, padding: '6px', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                flex: 1, background: '#1e2030', border: '1px solid #ffffff12', borderRadius: 4,
                color: '#94a3b8', fontSize: 11, padding: '6px', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: '#080810',
  border: '1px solid #ffffff0d',
  borderRadius: 4,
  padding: '6px 8px',
  color: '#e2e8f0',
  fontSize: 11,
  outline: 'none',
  resize: 'vertical',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};
