import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '../store';
import { NodeIcon } from '../NodeIcons';

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
  }[status] || null;
  const statusIcon = { success: '✓', failed: '✗', running: '…' }[status] || '';

  const isActive = selected || hovered;

  const borderColor = selected
    ? data.color
    : hovered
      ? `${data.color}80`
      : `${data.color}28`;

  const glow = selected
    ? `0 0 0 1px ${data.color}50, 0 0 28px ${data.color}40, 0 8px 24px rgba(0,0,0,0.8)`
    : hovered
      ? `0 0 0 1px ${data.color}30, 0 0 16px ${data.color}25, 0 4px 16px rgba(0,0,0,0.7)`
      : `0 2px 8px rgba(0,0,0,0.6)`;

  const category = data.nodeType?.split('.')[0]?.toUpperCase() || 'ACTION';

  return (
    <div
      onClick={() => openConfig({ id, data })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(145deg, #12121f 0%, #0d0d1a 100%)',
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        minWidth: 186,
        cursor: 'pointer',
        position: 'relative',
        boxShadow: glow,
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '10px 10px 0 0',
        background: isActive
          ? `linear-gradient(90deg, transparent, ${data.color}cc, transparent)`
          : `linear-gradient(90deg, transparent, ${data.color}50, transparent)`,
        transition: 'opacity 0.2s',
        overflow: 'hidden',
      }}/>

      {/* Status badge */}
      {status && (
        <div style={{
          position: 'absolute', top: -6, right: -6,
          background: statusColor, color: '#fff', borderRadius: '50%',
          width: 18, height: 18, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 9, fontWeight: 700,
          boxShadow: `0 0 10px ${statusColor}80`,
          ...(status === 'running' && { animation: 'pulse-ring 1s infinite' }),
        }}>{statusIcon}</div>
      )}

      {/* Delete button */}
      {hovered && !status && (
        <button
          onClick={e => { e.stopPropagation(); deleteNode(id); }}
          title="Delete (Del)"
          style={{
            position: 'absolute', top: -6, right: -6,
            width: 18, height: 18, borderRadius: '50%',
            background: '#12121f', border: '1px solid #ef444455',
            color: '#ef4444', fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', lineHeight: 1, padding: 0, zIndex: 10,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ef444422'; e.currentTarget.style.borderColor = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#12121f'; e.currentTarget.style.borderColor = '#ef444455'; }}
        >×</button>
      )}

      {/* Body */}
      <div style={{ padding: '10px 13px 9px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Icon block */}
          <div style={{
            width: 32, height: 32, flexShrink: 0,
            background: `${data.color}18`,
            border: `1px solid ${data.color}30`,
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isActive ? `0 0 12px ${data.color}35` : 'none',
            transition: 'box-shadow 0.2s',
          }}>
            <NodeIcon type={data.nodeType} size={14} color={data.color}/>
          </div>

          {/* Text */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 8, fontWeight: 700, letterSpacing: '1px',
              textTransform: 'uppercase', color: `${data.color}aa`,
              marginBottom: 2, lineHeight: 1,
            }}>{category}</div>
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#e2e8f0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              lineHeight: 1.3,
            }}>{data.label}</div>
          </div>
        </div>

        {/* Config preview */}
        {data.config && Object.keys(data.config).length > 0 && (
          <div style={{
            marginTop: 8,
            borderTop: `1px solid ${data.color}12`,
            paddingTop: 6,
          }}>
            {Object.entries(data.config).slice(0, 2).map(([k, v]) => (
              <div key={k} style={{
                fontSize: 9, lineHeight: 1.6,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: '#2d3a4d',
              }}>
                <span style={{ color: '#253040' }}>{k}:</span>{' '}
                {String(v).substring(0, 28)}{String(v).length > 28 ? '…' : ''}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Node ID */}
      <div style={{
        position: 'absolute', bottom: 3, right: 7,
        fontSize: 7.5, color: `${data.color}18`, fontFamily: 'monospace',
        letterSpacing: '0.2px',
      }}>{id}</div>

      {/* Handles */}
      <Handle type="target" position={Position.Left} className="automation-handle" style={{
        background: isActive ? data.color : `${data.color}60`,
        width: isActive ? 10 : 8, height: isActive ? 10 : 8,
        border: `1.5px solid ${isActive ? `${data.color}90` : '#0d0d1a'}`,
        boxShadow: isActive ? `0 0 6px ${data.color}40` : 'none',
        left: isActive ? -5 : -4,
        transition: 'all 0.15s ease',
        cursor: 'crosshair',
      }}/>
      <Handle type="source" position={Position.Right} className="automation-handle" style={{
        background: isActive ? data.color : `${data.color}60`,
        width: isActive ? 10 : 8, height: isActive ? 10 : 8,
        border: `1.5px solid ${isActive ? `${data.color}90` : '#0d0d1a'}`,
        boxShadow: isActive ? `0 0 6px ${data.color}40` : 'none',
        right: isActive ? -5 : -4,
        transition: 'all 0.15s ease',
        cursor: 'crosshair',
      }}/>
    </div>
  );
}
