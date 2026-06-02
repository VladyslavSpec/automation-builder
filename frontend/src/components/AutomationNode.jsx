import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '../store';

export default function AutomationNode({ id, data, selected }) {
  const openConfig = useStore(s => s.openConfig);
  const deleteNode = useStore(s => s.deleteNode);
  const lastExecution = useStore(s => s.lastExecution);
  const [hovered, setHovered] = useState(false);

  const nodeExec = lastExecution?.nodes?.find(n => n.node_id === id);
  const status = nodeExec?.status;

  const statusColor = {
    success: '#22c55e',
    failed: '#ef4444',
    running: '#f59e0b',
  }[status] || 'transparent';

  const statusIcon = { success: '✓', failed: '✗', running: '…' }[status] || '';

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    deleteNode(id);
  };

  return (
    <div
      onClick={() => openConfig({ id, data })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#12121f',
        border: `1.5px solid ${selected ? data.color : data.color + '60'}`,
        borderRadius: 8,
        padding: '9px 13px',
        minWidth: 175,
        cursor: 'pointer',
        position: 'relative',
        boxShadow: selected
          ? `0 0 0 2px ${data.color}30, 0 4px 16px #00000080`
          : '0 2px 8px #00000060',
        transition: 'border-color 0.1s, box-shadow 0.1s',
      }}
    >
      {/* Status indicator */}
      {status && (
        <div style={{
          position: 'absolute', top: -7, right: -7,
          background: statusColor, color: '#fff',
          borderRadius: '50%', width: 18, height: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700,
        }}>
          {statusIcon}
        </div>
      )}

      {/* Delete button — appears on hover */}
      {hovered && !status && (
        <button
          onClick={handleDeleteClick}
          title="Delete node  (Del)"
          style={{
            position: 'absolute', top: -7, right: -7,
            width: 18, height: 18, borderRadius: '50%',
            background: '#1e1e30', border: '1px solid #ef444460',
            color: '#ef4444', fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', lineHeight: 1, padding: 0,
            transition: 'background 0.1s',
            zIndex: 10,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#ef444425'}
          onMouseLeave={e => e.currentTarget.style.background = '#1e1e30'}
        >
          ×
        </button>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{data.icon}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: data.color, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {data.nodeType?.split('.')[0]}
          </div>
          <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.label}
          </div>
        </div>
      </div>

      {/* Config preview */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div style={{ marginTop: 7, borderTop: `1px solid ${data.color}20`, paddingTop: 5 }}>
          {Object.entries(data.config).slice(0, 2).map(([k, v]) => (
            <div key={k} style={{ fontSize: 9, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#334155' }}>{k}: </span>
              <span>{String(v).substring(0, 28)}{String(v).length > 28 ? '…' : ''}</span>
            </div>
          ))}
        </div>
      )}

      {/* Node ID badge */}
      <div style={{ position: 'absolute', bottom: 3, right: 7, fontSize: 8, color: data.color + '30', fontFamily: 'monospace' }}>
        {id}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        style={{ background: data.color, width: 9, height: 9, border: `2px solid #12121f` }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: data.color, width: 9, height: 9, border: `2px solid #12121f` }}
      />
    </div>
  );
}
