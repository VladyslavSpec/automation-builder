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

  const statusColor = { success: '#22c55e', failed: '#ef4444', running: '#f59e0b', pending: '#64748b' };
  const statusIcon  = { success: '✓', failed: '✗', running: '⟳', pending: '○' };

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

      {/* Run section */}
      <div>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Trigger Data (JSON)</div>
        <textarea
          rows={3}
          value={triggerData}
          onChange={e => setTriggerData(e.target.value)}
          style={{
            width: '100%', background: '#1e1e2e', border: `1px solid ${jsonError ? '#ef4444' : '#ffffff15'}`,
            borderRadius: 6, padding: '6px 8px', color: '#f1f5f9', fontSize: 11,
            fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
          }}
        />
        {jsonError && <div style={{ color: '#ef4444', fontSize: 10, marginTop: 2 }}>{jsonError}</div>}
        <button
          onClick={handleRun}
          disabled={isRunning}
          style={{
            marginTop: 8, width: '100%', padding: '8px',
            background: isRunning ? '#1e1e2e' : '#6366f1',
            color: isRunning ? '#64748b' : '#fff',
            border: 'none', borderRadius: 6, cursor: isRunning ? 'default' : 'pointer',
            fontSize: 13, fontWeight: 600, transition: 'background 0.2s',
          }}
        >
          {isRunning ? '⟳  Running...' : '▶  Run Workflow'}
        </button>
      </div>

      {/* Last execution result */}
      {lastExecution && (
        <div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Last Run</div>
          <div style={{
            background: '#1e1e2e', borderRadius: 8, padding: '10px 12px',
            border: `1px solid ${statusColor[lastExecution.status] || '#ffffff15'}22`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ color: statusColor[lastExecution.status], fontWeight: 700 }}>
                {statusIcon[lastExecution.status]} {lastExecution.status?.toUpperCase()}
              </span>
            </div>
            {lastExecution.nodes?.map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
                <span style={{ color: statusColor[n.status], fontSize: 11, marginTop: 1 }}>
                  {statusIcon[n.status]}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600 }}>{n.node_type}</div>
                  {n.status === 'failed' && (
                    <div style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>{n.error}</div>
                  )}
                  {n.status === 'success' && n.output_data && (
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {JSON.stringify(n.output_data).substring(0, 80)}
                      {JSON.stringify(n.output_data).length > 80 ? '…' : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {executions.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>History</div>
          {executions.slice(0, 10).map(e => (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '5px 8px', background: '#1e1e2e', borderRadius: 6, marginBottom: 4,
            }}>
              <span style={{ color: statusColor[e.status], fontSize: 12 }}>
                {statusIcon[e.status]} {e.status}
              </span>
              <span style={{ fontSize: 10, color: '#64748b' }}>
                {e.started_at ? new Date(e.started_at).toLocaleTimeString() : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
