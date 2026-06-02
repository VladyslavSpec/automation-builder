import { useStore } from '../store';
import { NODE_MAP } from '../nodeTypes';

export default function ConfigPanel() {
  const configPanelNode = useStore(s => s.configPanelNode);
  const closeConfig = useStore(s => s.closeConfig);
  const updateNodeConfig = useStore(s => s.updateNodeConfig);
  const nodes = useStore(s => s.nodes);

  if (!configPanelNode) return null;

  const liveNode = nodes.find(n => n.id === configPanelNode.id);
  const data = liveNode?.data || configPanelNode.data;
  const catalog = NODE_MAP[data.nodeType] || {};
  const fields = catalog.fields || data.fields || [];

  return (
    <div style={{
      width: 300,
      background: '#13131f',
      borderLeft: '1px solid #ffffff10',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid #ffffff10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{data.icon}</span>
          <div>
            <div style={{ color: data.color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
              {data.nodeType}
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{data.label}</div>
          </div>
        </div>
        <button onClick={closeConfig} style={{
          background: 'none', border: 'none', color: '#64748b',
          cursor: 'pointer', fontSize: 18, lineHeight: 1,
        }}>×</button>
      </div>

      {/* Node ID */}
      <div style={{ padding: '6px 14px', background: '#0f0f1a', borderBottom: '1px solid #ffffff10' }}>
        <span style={{ fontSize: 10, color: '#64748b' }}>Node ID: </span>
        <span style={{ fontSize: 10, color: '#f59e0b', fontFamily: 'monospace' }}>{configPanelNode.id}</span>
        <span style={{ fontSize: 10, color: '#64748b', marginLeft: 8 }}>→ reference as </span>
        <span style={{ fontSize: 10, color: '#a855f7', fontFamily: 'monospace' }}>{'{{' + configPanelNode.id + '.field}}'}</span>
      </div>

      {/* Fields */}
      <div style={{ padding: '12px 14px', overflowY: 'auto', flex: 1 }}>
        {fields.length === 0 && (
          <div style={{ color: '#64748b', fontSize: 12 }}>No configuration needed.</div>
        )}
        {fields.map(field => (
          <div key={field.key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>
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
      <div style={{ padding: '10px 14px', borderTop: '1px solid #ffffff10', background: '#0f0f1a' }}>
        <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>
          <div style={{ color: '#a855f7', marginBottom: 2 }}>💡 Template syntax:</div>
          <code style={{ color: '#f59e0b' }}>{'{{trigger.field}}'}</code> — trigger data<br />
          <code style={{ color: '#f59e0b' }}>{'{{nodeId.field}}'}</code> — node output<br />
          <code style={{ color: '#f59e0b' }}>{'{{env.VAR_NAME}}'}</code> — env variable
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: '#1e1e2e',
  border: '1px solid #ffffff15',
  borderRadius: 6,
  padding: '6px 8px',
  color: '#f1f5f9',
  fontSize: 12,
  outline: 'none',
  resize: 'vertical',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};
