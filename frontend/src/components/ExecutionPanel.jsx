import { useStore } from '../store';
import { useState } from 'react';

export default function ExecutionPanel() {
  const isRunning = useStore(s => s.isRunning);
  const runWorkflow = useStore(s => s.runWorkflow);
  const lastExecution = useStore(s => s.lastExecution);
  const executions = useStore(s => s.executions);
  const [triggerData, setTriggerData] = useState('{}');
  const [jsonError, setJsonError] = useState('');

  const handleRun = () => {
    try {
      const data = JSON.parse(triggerData);
      setJsonError('');
      runWorkflow(data);
    } catch {
      setJsonError('Invalid JSON');
    }
  };

  const statusColor = {
    success: '#22c55e',
    failed: '#ef4444',
    running: '#f59e0b',
    pending: '#64748b',
  };

  const sectionLabel = {
    fontSize: 9,
    color: '#334155',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 8,
  };

  const cardBase = {
    background: '#080810',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: '12px',
  };

  return (
    <div style={{
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      overflowY: 'auto',
    }}>

      {/* ── Trigger Data ── */}
      <div>
        <div style={sectionLabel}>Trigger Data</div>
        <textarea
          rows={3}
          value={triggerData}
          onChange={e => setTriggerData(e.target.value)}
          style={{
            width: '100%',
            background: '#080810',
            border: `1px solid ${jsonError ? '#ef444466' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 6,
            padding: '8px 10px',
            color: '#94a3b8',
            fontSize: 11,
            fontFamily: 'monospace',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
        />
        {jsonError && (
          <div style={{
            color: '#f87171',
            fontSize: 10,
            marginTop: 3,
          }}>
            {jsonError}
          </div>
        )}

        <button
          onClick={handleRun}
          disabled={isRunning}
          style={{
            marginTop: 8,
            width: '100%',
            padding: '9px',
            background: isRunning
              ? '#1e2030'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: isRunning ? '#334155' : '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: isRunning ? 'default' : 'pointer',
            fontSize: 12,
            fontWeight: 700,
            transition: 'opacity 0.15s',
            letterSpacing: '0.3px',
          }}
          onMouseEnter={e => {
            if (!isRunning) e.currentTarget.style.opacity = '0.88';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {isRunning ? 'Running...' : 'Run Workflow'}
        </button>
      </div>

      {/* ── Last Run ── */}
      {lastExecution && (
        <div>
          <div style={sectionLabel}>Last Run</div>
          <div style={cardBase}>

            {/* Overall status badge */}
            <div style={{ marginBottom: 10 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: `${statusColor[lastExecution.status] || '#64748b'}20`,
                border: `1px solid ${statusColor[lastExecution.status] || '#64748b'}40`,
                borderRadius: 20,
                padding: '3px 9px',
                fontSize: 10,
                fontWeight: 700,
                color: statusColor[lastExecution.status] || '#64748b',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                {lastExecution.status}
              </span>
            </div>

            {/* Node execution rows */}
            {lastExecution.nodes?.map(n => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  marginBottom: 8,
                  paddingBottom: 8,
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {/* Status dot */}
                <div style={{
                  flexShrink: 0,
                  marginTop: 3,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: statusColor[n.status] || '#64748b',
                  boxShadow: n.status === 'running'
                    ? `0 0 6px ${statusColor.running}`
                    : undefined,
                  animation: n.status === 'running' ? 'pulse-ring 1.2s ease-out infinite' : undefined,
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Node type + ID row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                      {n.node_type}
                    </span>
                    <span style={{
                      fontSize: 10,
                      color: '#334155',
                      fontFamily: 'monospace',
                    }}>
                      #{n.node_id || n.id}
                    </span>
                  </div>

                  {/* Error */}
                  {n.status === 'failed' && n.error && (
                    <div style={{
                      marginTop: 2,
                      fontSize: 10,
                      color: '#f87171',
                      wordBreak: 'break-word',
                    }}>
                      {n.error}
                    </div>
                  )}

                  {/* Output preview */}
                  {n.status === 'success' && n.output_data && (
                    <div style={{
                      marginTop: 2,
                      fontSize: 10,
                      color: '#334155',
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {(() => {
                        const str = JSON.stringify(n.output_data);
                        return str.length > 60 ? str.substring(0, 60) + '…' : str;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── History ── */}
      {executions.length > 0 && (
        <div>
          <div style={sectionLabel}>History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {executions.slice(0, 10).map((e, i) => (
              <div
                key={e.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  background: i % 2 === 0 ? '#080810' : 'transparent',
                  borderRadius: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: statusColor[e.status] || '#64748b',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 11,
                    color: statusColor[e.status] || '#64748b',
                    fontWeight: 500,
                  }}>
                    {e.status}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: '#334155' }}>
                  {e.started_at ? new Date(e.started_at).toLocaleTimeString() : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
