import { useEffect, useState } from 'react';
import { useStore } from '../store';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function WorkflowsPanel() {
  const workflows = useStore(s => s.workflows);
  const workflowsLoading = useStore(s => s.workflowsLoading);
  const currentId = useStore(s => s.workflowId);
  const fetchWorkflows = useStore(s => s.fetchWorkflows);
  const loadWorkflow = useStore(s => s.loadWorkflow);
  const deleteWorkflow = useStore(s => s.deleteWorkflow);
  const newWorkflow = useStore(s => s.newWorkflow);
  const setActiveSidebarPanel = useStore(s => s.setActiveSidebarPanel);

  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchWorkflows(); }, []);

  const filtered = workflows.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLoad = (wf) => {
    loadWorkflow(wf);
    setActiveSidebarPanel('nodes');
  };

  const handleNew = () => {
    newWorkflow();
    setActiveSidebarPanel('nodes');
  };

  const handleDelete = async (id) => {
    await deleteWorkflow(id);
    setConfirmDelete(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid #ffffff10', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>My Workflows</span>
          <button
            onClick={handleNew}
            style={{
              background: '#6366f1', border: 'none', borderRadius: 5, color: '#fff',
              fontSize: 11, fontWeight: 600, padding: '3px 8px', cursor: 'pointer',
            }}
          >
            + New
          </button>
        </div>
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

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {workflowsLoading && (
          <div style={{ padding: '20px 12px', color: '#64748b', fontSize: 12, textAlign: 'center' }}>
            Loading...
          </div>
        )}

        {!workflowsLoading && filtered.length === 0 && (
          <div style={{ padding: '24px 12px', color: '#475569', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
            {workflows.length === 0
              ? <>No workflows yet.<br />Click <strong>+ New</strong> to create one.</>
              : 'No results.'}
          </div>
        )}

        {filtered.map(wf => (
          <div key={wf.id}>
            {confirmDelete === wf.id ? (
              <div style={{ margin: '4px 8px', padding: '8px 10px', background: '#ef444415', borderRadius: 6, border: '1px solid #ef444430' }}>
                <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 6 }}>Delete "{wf.name}"?</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleDelete(wf.id)}
                    style={{ flex: 1, background: '#ef4444', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11, padding: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    style={{ flex: 1, background: '#ffffff10', border: 'none', borderRadius: 4, color: '#94a3b8', fontSize: 11, padding: '4px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleLoad(wf)}
                style={{
                  margin: '2px 8px', padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                  background: wf.id === currentId ? '#6366f115' : 'transparent',
                  border: `1px solid ${wf.id === currentId ? '#6366f140' : 'transparent'}`,
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => { if (wf.id !== currentId) e.currentTarget.style.background = '#ffffff08'; }}
                onMouseLeave={e => { if (wf.id !== currentId) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ fontSize: 12, color: wf.id === currentId ? '#a5b4fc' : '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {wf.name}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDelete(wf.id); }}
                    style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 13, padding: 0, flexShrink: 0, lineHeight: 1 }}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                  {timeAgo(wf.updated_at || wf.created_at)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
