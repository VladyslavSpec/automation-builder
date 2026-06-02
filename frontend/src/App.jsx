import { useCallback, useRef, useEffect } from 'react';
import { useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';

import { useStore } from './store';
import AutomationNode from './components/AutomationNode';
import Sidebar from './components/Sidebar';
import ConfigPanel from './components/ConfigPanel';
import ExecutionPanel from './components/ExecutionPanel';
import AuthPage from './components/AuthPage';
import DotBackground from './components/DotBackground';
import FlowControls from './components/FlowControls';

const API = import.meta.env.VITE_API_URL || '';
const nodeTypes = { automationNode: AutomationNode };

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { setAuthChecked(true); return; }
    axios.get(`${API}/auth/me`)
      .then(res => { setUser(res.data); setAuthChecked(true); })
      .catch(() => { localStorage.removeItem('auth_token'); setAuthChecked(true); });
  }, []);

  const handleAuth = (token) => {
    localStorage.setItem('auth_token', token);
    axios.get(`${API}/auth/me`).then(res => setUser(res.data));
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a12', color: '#334155', fontSize: 13, letterSpacing: 0.5 }}>
        Loading
      </div>
    );
  }

  if (!user) return <AuthPage onAuth={handleAuth} />;

  return <WorkflowEditor user={user} onLogout={handleLogout} />;
}

function WorkflowEditor({ user, onLogout }) {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const onNodesChange = useStore(s => s.onNodesChange);
  const onEdgesChange = useStore(s => s.onEdgesChange);
  const onConnect = useStore(s => s.onConnect);
  const addNode = useStore(s => s.addNode);
  const saveWorkflow = useStore(s => s.saveWorkflow);
  const runWorkflow = useStore(s => s.runWorkflow);
  const isSaving = useStore(s => s.isSaving);
  const isRunning = useStore(s => s.isRunning);
  const workflowName = useStore(s => s.workflowName);
  const setWorkflowName = useStore(s => s.setWorkflowName);
  const configPanelNode = useStore(s => s.configPanelNode);
  const closeConfig = useStore(s => s.closeConfig);
  const fetchWorkflows = useStore(s => s.fetchWorkflows);
  const history = useStore(s => s.history);
  const historyFuture = useStore(s => s.historyFuture);

  const reactFlowWrapper = useRef(null);

  useEffect(() => { fetchWorkflows(); }, []);

  // ─── Global Hotkeys ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;
      const ctrl = e.ctrlKey || e.metaKey;

      // Always-on shortcuts
      if (ctrl && e.key === 's') { e.preventDefault(); saveWorkflow(); return; }
      if (ctrl && e.key === 'Enter') { e.preventDefault(); runWorkflow(); return; }
      if (e.key === 'Escape') { closeConfig(); return; }

      // Shortcuts blocked when inside an input
      if (inInput) return;

      if (ctrl && !e.shiftKey && e.key === 'z') { e.preventDefault(); useStore.getState().undo(); return; }
      if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); useStore.getState().redo(); return; }
      if (ctrl && e.key === 'a') { e.preventDefault(); useStore.getState().selectAll(); return; }
      if (ctrl && e.key === 'c') { e.preventDefault(); useStore.getState().copySelected(); return; }
      if (ctrl && e.key === 'v') { e.preventDefault(); useStore.getState().pasteClipboard(); return; }
      if (ctrl && e.key === 'd') { e.preventDefault(); useStore.getState().duplicateSelected(); return; }
      if (ctrl && e.key === 'n') { e.preventDefault(); useStore.getState().newWorkflow(); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); useStore.getState().deleteSelected(); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveWorkflow, runWorkflow, closeConfig]);

  const onDragOver = useCallback(e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    const nodeMeta = JSON.parse(e.dataTransfer.getData('nodeMeta') || '{}');
    if (!nodeType) return;
    addNode(nodeType, nodeMeta);
  }, [addNode]);

  const topbarBtn = (primary) => ({
    background: primary ? '#6366f1' : 'transparent',
    border: `1px solid ${primary ? '#6366f1' : '#ffffff12'}`,
    borderRadius: 4,
    color: primary ? '#fff' : '#94a3b8',
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: primary ? 600 : 400,
    letterSpacing: 0.3,
    whiteSpace: 'nowrap',
    transition: 'opacity 0.1s',
  });

  const HOTKEY_HINTS = [
    ['Ctrl+S', 'Save'],
    ['Ctrl+↵', 'Run'],
    ['Ctrl+Z', 'Undo'],
    ['Ctrl+D', 'Duplicate'],
    ['Del', 'Delete'],
    ['Ctrl+A', 'Select all'],
    ['Ctrl+⇧H', 'Fit view'],
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a12', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar user={user} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{
          height: 44, background: '#0d0d1a', borderBottom: '1px solid #ffffff0d',
          display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, flexShrink: 0,
        }}>
          <input
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            style={{
              background: 'none', border: 'none', color: '#e2e8f0', fontSize: 13,
              fontWeight: 500, outline: 'none', minWidth: 0, flex: 1, maxWidth: 280,
              letterSpacing: 0.1,
            }}
          />
          <div style={{ flex: 1 }} />
          {/* Undo/Redo buttons */}
          <button
            onClick={() => useStore.getState().undo()}
            disabled={history.length === 0}
            title="Undo  (Ctrl+Z)"
            style={{
              background: 'none', border: 'none', color: history.length > 0 ? '#64748b' : '#1e2030',
              cursor: history.length > 0 ? 'pointer' : 'default', fontSize: 14, padding: '2px 4px',
            }}
          >↩</button>
          <button
            onClick={() => useStore.getState().redo()}
            disabled={historyFuture.length === 0}
            title="Redo  (Ctrl+Y)"
            style={{
              background: 'none', border: 'none', color: historyFuture.length > 0 ? '#64748b' : '#1e2030',
              cursor: historyFuture.length > 0 ? 'pointer' : 'default', fontSize: 14, padding: '2px 4px', marginRight: 4,
            }}
          >↪</button>
          <span style={{ fontSize: 10, color: '#1e2a3a', whiteSpace: 'nowrap', letterSpacing: 0.3 }}>
            {nodes.length} nodes · {edges.length} edges
          </span>
          <button
            onClick={saveWorkflow}
            disabled={isSaving}
            title="Save  (Ctrl+S)"
            style={{ ...topbarBtn(false), opacity: isSaving ? 0.4 : 1 }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => runWorkflow()}
            disabled={isRunning}
            title="Run  (Ctrl+Enter)"
            style={{ ...topbarBtn(true), opacity: isRunning ? 0.5 : 1 }}
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>

        {/* Hotkey hint bar */}
        <div style={{
          height: 24, background: '#080810', borderBottom: '1px solid #ffffff07',
          display: 'flex', alignItems: 'center', padding: '0 14px', gap: 14, flexShrink: 0,
          overflowX: 'auto',
        }}>
          {HOTKEY_HINTS.map(([key, label]) => (
            <span key={key} style={{ fontSize: 10, color: '#253040', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              <kbd style={{
                background: '#0c0c18', border: '1px solid #ffffff08', borderRadius: 3,
                padding: '0px 5px', fontSize: 9, color: '#3d4f62', fontFamily: 'monospace', letterSpacing: 0,
              }}>
                {key}
              </kbd>
              {label}
            </span>
          ))}
        </div>

        {/* Canvas */}
        <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
          <DotBackground />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={null}
            style={{ background: 'transparent', position: 'relative', zIndex: 1 }}
          >
            <FlowControls />
            <Controls
              style={{ background: '#0d0d1a', border: '1px solid #ffffff0d', borderRadius: 4 }}
              showInteractive={false}
            />
            <MiniMap
              nodeColor={n => n.data?.color || '#6366f1'}
              style={{ background: '#0d0d1a', border: '1px solid #ffffff0d', borderRadius: 4 }}
              maskColor="rgba(0,0,0,0.6)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 300, background: '#0d0d1a', borderLeft: '1px solid #ffffff0d',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {configPanelNode ? (
          <ConfigPanel />
        ) : (
          <>
            <div style={{ padding: '11px 14px', borderBottom: '1px solid #ffffff0d' }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Execution
              </div>
            </div>
            <ExecutionPanel />
          </>
        )}
      </div>
    </div>
  );
}
