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

  const cardBoxShadow = selected
    ? `0 0 0 3px ${data.color}20, 0 0 20px ${data.color}30, 0 4px 20px #00000090`
    : hovered
      ? `0 0 0 1px ${data.color}40, 0 4px 16px #00000080`
      : '0 2px 8px #00000070';

  const cardBorder = selected
    ? `1.5px solid ${data.color}`
    : hovered
      ? `1.5px solid ${data.color}80`
      : `1.5px solid ${data.color}35`;

  return (
    <div
      onClick={() => openConfig({ id, data })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0e0e1c',
        border: cardBorder,
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 168,
        cursor: 'pointer',
        position: 'relative',
        boxShadow: cardBoxShadow,
        transition: 'all 0.18s',
      }}
    >
      {/* Status indicator — pulsing ring when running, solid icon badge otherwise */}
      {status === 'running' && (
        <>
          <div
            className="pulse-ring"
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid ${statusColor}`,
              pointerEvents: 'none',
            }}
          />
          <div style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: statusColor,
            color: '#fff',
            borderRadius: '50%',
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 700,
          }}>
            {statusIcon}
          </div>
        </>
      )}

      {(status === 'success' || status === 'failed') && (
        <div style={{
          position: 'absolute',
          top: -6,
          right: -6,
          background: statusColor,
          color: '#fff',
          borderRadius: '50%',
          width: 18,
          height: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 9,
          fontWeight: 700,
          boxShadow: `0 0 8px ${statusColor}60`,
        }}>
          {statusIcon}
        </div>
      )}

      {/* Delete button — appears on hover when not executing */}
      {hovered && !status && (
        <button
          onClick={handleDeleteClick}
          title="Delete node (Del)"
          style={{
            position: 'absolute',
            top: -7,
            right: -7,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#0e0e1c',
            border: '1px solid #ef444455',
            color: '#ef4444',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            lineHeight: 1,
            padding: 0,
            transition: 'background 0.15s, border-color 0.15s',
            zIndex: 10,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#ef444420';
            e.currentTarget.style.borderColor = '#ef4444aa';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#0e0e1c';
            e.currentTarget.style.borderColor = '#ef444455';
          }}
        >
          ×
        </button>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Icon pill */}
        <span style={{
          fontSize: 15,
          flexShrink: 0,
          background: `${data.color}20`,
          border: `1px solid ${data.color}30`,
          borderRadius: 5,
          padding: '3px 6px',
          lineHeight: 1.2,
          display: 'inline-block',
        }}>
          {data.icon}
        </span>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            color: data.color,
            fontSize: 8,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: 1,
          }}>
            {data.nodeType?.split('.')[0]}
          </div>
          <div style={{
            color: '#e2e8f0',
            fontSize: 12,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {data.label}
          </div>
        </div>
      </div>

      {/* Config preview — first 2 fields */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div style={{
          marginTop: 7,
          borderTop: `1px solid ${data.color}18`,
          paddingTop: 6,
        }}>
          {Object.entries(data.config).slice(0, 2).map(([k, v]) => (
            <div
              key={k}
              style={{
                fontSize: 9,
                color: '#475569',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: '#334155' }}>{k}:</span>{' '}
              <span>{String(v).substring(0, 28)}{String(v).length > 28 ? '…' : ''}</span>
            </div>
          ))}
        </div>
      )}

      {/* Node ID badge */}
      <div style={{
        position: 'absolute',
        bottom: 3,
        right: 7,
        fontSize: 8,
        color: `${data.color}25`,
        fontFamily: 'monospace',
        letterSpacing: '0.3px',
      }}>
        {id}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: data.color,
          width: 8,
          height: 8,
          border: `2px solid #0e0e1c`,
          boxShadow: `0 0 6px ${data.color}60`,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: data.color,
          width: 8,
          height: 8,
          border: `2px solid #0e0e1c`,
          boxShadow: `0 0 6px ${data.color}60`,
        }}
      />
    </div>
  );
}
