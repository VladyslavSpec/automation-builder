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
    failed:  '#ef4444',
    running: '#f59e0b',
  }[status] || 'transparent';
  const statusIcon = { success: '✓', failed: '✗', running: '…' }[status] || '';

  // Gradient border strength based on state
  const borderGrad = selected
    ? `linear-gradient(135deg, ${data.color}cc, ${data.color}44, ${data.color}99)`
    : hovered
      ? `linear-gradient(135deg, ${data.color}66, ${data.color}22, ${data.color}44)`
      : `linear-gradient(135deg, ${data.color}30, ${data.color}0a, ${data.color}20)`;

  const outerGlow = selected
    ? `0 0 0 1px ${data.color}30, 0 0 28px ${data.color}50, 0 8px 32px rgba(0,0,0,0.8)`
    : hovered
      ? `0 0 0 1px ${data.color}18, 0 0 16px ${data.color}30, 0 4px 20px rgba(0,0,0,0.7)`
      : `0 4px 16px rgba(0,0,0,0.6)`;

  return (
    <div
      onClick={() => openConfig({ id, data })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: borderGrad,
        borderRadius: 12,
        padding: 1.5,
        boxShadow: outerGlow,
        transition: 'box-shadow 0.2s, background 0.2s',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Inner card */}
      <div style={{
        background: 'linear-gradient(145deg, #111120 0%, #0b0b16 100%)',
        borderRadius: 11,
        padding: '11px 14px',
        minWidth: 172,
      }}>

        {/* Status: running ring */}
        {status === 'running' && (
          <>
            <div className="pulse-ring" style={{
              position: 'absolute', top: -8, right: -8,
              width: 22, height: 22, borderRadius: '50%',
              border: `2px solid ${statusColor}`, pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', top: -7, right: -7,
              background: statusColor, color: '#fff', borderRadius: '50%',
              width: 18, height: 18, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 9, fontWeight: 700,
            }}>{statusIcon}</div>
          </>
        )}

        {/* Status: success / failed */}
        {(status === 'success' || status === 'failed') && (
          <div style={{
            position: 'absolute', top: -7, right: -7,
            background: statusColor, color: '#fff', borderRadius: '50%',
            width: 18, height: 18, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 9, fontWeight: 700,
            boxShadow: `0 0 10px ${statusColor}80`,
          }}>{statusIcon}</div>
        )}

        {/* Delete button on hover */}
        {hovered && !status && (
          <button
            onClick={e => { e.stopPropagation(); deleteNode(id); }}
            title="Delete  (Del)"
            style={{
              position: 'absolute', top: -7, right: -7,
              width: 18, height: 18, borderRadius: '50%',
              background: '#0b0b16', border: '1px solid #ef444460',
              color: '#ef4444', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', lineHeight: 1, padding: 0, zIndex: 10,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ef444425'; e.currentTarget.style.borderColor = '#ef4444aa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0b0b16'; e.currentTarget.style.borderColor = '#ef444460'; }}
          >×</button>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 14, flexShrink: 0,
            background: `${data.color}20`,
            border: `1px solid ${data.color}35`,
            borderRadius: 6, padding: '3px 7px', lineHeight: 1.2,
            boxShadow: hovered || selected ? `0 0 8px ${data.color}30` : 'none',
            transition: 'box-shadow 0.2s',
          }}>{data.icon}</span>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              color: data.color, fontSize: 8, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 2,
              opacity: 0.85,
            }}>
              {data.nodeType?.split('.')[0]}
            </div>
            <div style={{
              color: '#e2e8f0', fontSize: 12, fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {data.label}
            </div>
          </div>
        </div>

        {/* Config preview */}
        {data.config && Object.keys(data.config).length > 0 && (
          <div style={{ marginTop: 8, borderTop: `1px solid ${data.color}15`, paddingTop: 6 }}>
            {Object.entries(data.config).slice(0, 2).map(([k, v]) => (
              <div key={k} style={{
                fontSize: 9, color: '#3d4f62', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.7,
              }}>
                <span style={{ color: '#2d3a4a' }}>{k}:</span>{' '}
                {String(v).substring(0, 26)}{String(v).length > 26 ? '…' : ''}
              </div>
            ))}
          </div>
        )}

        {/* Node ID */}
        <div style={{
          position: 'absolute', bottom: 4, right: 8,
          fontSize: 8, color: `${data.color}22`, fontFamily: 'monospace',
        }}>{id}</div>

        {/* Handles */}
        <Handle type="target" position={Position.Left} style={{
          background: data.color, width: 9, height: 9,
          border: '2px solid #0b0b16', boxShadow: `0 0 8px ${data.color}70`,
        }} />
        <Handle type="source" position={Position.Right} style={{
          background: data.color, width: 9, height: 9,
          border: '2px solid #0b0b16', boxShadow: `0 0 8px ${data.color}70`,
        }} />
      </div>
    </div>
  );
}
