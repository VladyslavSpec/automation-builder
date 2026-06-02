import { Handle, Position } from '@xyflow/react';
import { useStore } from '../store';

export default function AutomationNode({ id, data, selected }) {
  const openConfig = useStore(s => s.openConfig);
  const lastExecution = useStore(s => s.lastExecution);

  const nodeExec = lastExecution?.nodes?.find(n => n.node_id === id);
  const status = nodeExec?.status;

  const statusColor = {
    success: '#22c55e',
    failed: '#ef4444',
    running: '#f59e0b',
  }[status] || 'transparent';

  const statusIcon = { success: '✓', failed: '✗', running: '…' }[status] || '';

  return (
    <div
      onClick={() => openConfig({ id, data })}
      style={{
        background: '#1e1e2e',
        border: `2px solid ${selected ? '#fff' : data.color}`,
        borderRadius: 12,
        padding: '10px 14px',
        minWidth: 180,
        cursor: 'pointer',
        position: 'relative',
        boxShadow: selected ? `0 0 0 3px ${data.color}44` : '0 4px 12px #0006',
        transition: 'all 0.15s',
      }}
    >
      {/* Status indicator */}
      {status && (
        <div style={{
          position: 'absolute', top: -8, right: -8,
          background: statusColor, color: '#fff',
          borderRadius: '50%', width: 20, height: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700,
        }}>
          {statusIcon}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{data.icon}</span>
        <div>
          <div style={{ color: data.color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            {data.nodeType?.split('.')[0]}
          </div>
          <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>
            {data.label}
          </div>
        </div>
      </div>

      {/* Config preview */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div style={{ marginTop: 8, borderTop: '1px solid #ffffff15', paddingTop: 6 }}>
          {Object.entries(data.config).slice(0, 2).map(([k, v]) => (
            <div key={k} style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#64748b' }}>{k}: </span>
              <span>{String(v).substring(0, 30)}{String(v).length > 30 ? '…' : ''}</span>
            </div>
          ))}
        </div>
      )}

      {/* Node ID badge */}
      <div style={{ position: 'absolute', bottom: 4, right: 8, fontSize: 9, color: '#ffffff30' }}>
        #{id}
      </div>

      <Handle type="target" position={Position.Left} style={{ background: data.color, width: 10, height: 10, border: '2px solid #1e1e2e' }} />
      <Handle type="source" position={Position.Right} style={{ background: data.color, width: 10, height: 10, border: '2px solid #1e1e2e' }} />
    </div>
  );
}
