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
  const loadSampleWorkflow = useStore(s => s.loadSampleWorkflow);
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
          height: 44, background: '#0a0a14',
          borderBottom: '1px solid #ffffff0a',
          display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginRight: 6, flexShrink: 0 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 5,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 10px rgba(99,102,241,0.4)',
            }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" fill="rgba(255,255,255,0.95)"/>
                <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" fill="rgba(255,255,255,0.6)"/>
                <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" fill="rgba(255,255,255,0.6)"/>
                <rect x="9" y="9" width="5.5" height="5.5" rx="1" fill="rgba(255,255,255,0.35)"/>
              </svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', letterSpacing: -0.2, whiteSpace: 'nowrap' }}>
              FlowBuilder
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 18, background: '#ffffff10', flexShrink: 0 }}/>

          {/* Workflow name */}
          <input
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            style={{
              background: 'none', border: 'none', color: '#94a3b8', fontSize: 12,
              fontWeight: 500, outline: 'none', minWidth: 0, flex: 1, maxWidth: 220,
              letterSpacing: 0.1, fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.color = '#e2e8f0'}
            onBlur={e => e.target.style.color = '#94a3b8'}
          />

          <div style={{ flex: 1 }}/>

          {/* Node/edge count */}
          <span style={{ fontSize: 10, color: '#1e2a3a', whiteSpace: 'nowrap', letterSpacing: 0.3, marginRight: 4 }}>
            {nodes.length}n · {edges.length}e
          </span>

          {/* Undo */}
          <button
            onClick={() => useStore.getState().undo()}
            disabled={history.length === 0}
            title="Undo (Ctrl+Z)"
            style={{
              background: 'none', border: 'none',
              color: history.length > 0 ? '#475569' : '#1a1e2e',
              cursor: history.length > 0 ? 'pointer' : 'default',
              fontSize: 13, padding: '3px 5px', lineHeight: 1,
            }}
          >↩</button>

          {/* Redo */}
          <button
            onClick={() => useStore.getState().redo()}
            disabled={historyFuture.length === 0}
            title="Redo (Ctrl+Y)"
            style={{
              background: 'none', border: 'none',
              color: historyFuture.length > 0 ? '#475569' : '#1a1e2e',
              cursor: historyFuture.length > 0 ? 'pointer' : 'default',
              fontSize: 13, padding: '3px 5px', lineHeight: 1, marginRight: 4,
            }}
          >↪</button>

          {/* Save */}
          <button
            onClick={saveWorkflow}
            disabled={isSaving}
            title="Save (Ctrl+S)"
            style={{
              background: 'transparent', border: '1px solid #ffffff12',
              borderRadius: 5, color: isSaving ? '#334155' : '#64748b',
              padding: '4px 12px', cursor: isSaving ? 'default' : 'pointer',
              fontSize: 11, fontWeight: 500, letterSpacing: 0.2,
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!isSaving) { e.currentTarget.style.borderColor = '#ffffff25'; e.currentTarget.style.color = '#94a3b8'; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#ffffff12'; e.currentTarget.style.color = '#64748b'; }}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>

          {/* Run */}
          <button
            onClick={() => runWorkflow()}
            disabled={isRunning}
            title="Run (Ctrl+Enter)"
            style={{
              background: isRunning ? '#4f46e5' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
              border: 'none', borderRadius: 5, color: '#fff',
              padding: '4px 14px', cursor: isRunning ? 'default' : 'pointer',
              fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
              fontFamily: 'inherit', opacity: isRunning ? 0.6 : 1,
              boxShadow: isRunning ? 'none' : '0 0 14px rgba(99,102,241,0.35)',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {isRunning ? (
              <>
                <span style={{
                  display: 'inline-block', width: 9, height: 9,
                  border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                }}/>
                Running
              </>
            ) : (
              <>
                <svg width="8" height="9" viewBox="0 0 8 9" fill="white"><path d="M1 1l6 3.5L1 8V1Z"/></svg>
                Run
              </>
            )}
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
        <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative', background: '#07070f' }}>
          {/* Ambient glows */}
          <div style={{
            position: 'absolute', top: '15%', left: '25%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
            filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
            animation: 'blobFloat1 22s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '5%', right: '15%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
            filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
            animation: 'blobFloat2 28s ease-in-out infinite',
          }} />
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
          {nodes.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5,
            }}>
              <div style={{ pointerEvents: 'all', textAlign: 'center', maxWidth: 360 }}>
                <div style={{
                  width: 56, height: 56, margin: '0 auto 20px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 32px rgba(99,102,241,0.35)',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  </svg>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 8, letterSpacing: -0.3 }}>
                  Start building your workflow
                </div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 24 }}>
                  Drag nodes from the left panel onto the canvas,<br/>or load a sample workflow to explore.
                </div>
                <button
                  onClick={loadSampleWorkflow}
                  style={{
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer',
                    boxShadow: '0 0 24px rgba(99,102,241,0.3)',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 36px rgba(99,102,241,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.3)'}
                >
                  Load sample workflow
                </button>
                <div style={{ fontSize: 11, color: '#1e2a3a', marginTop: 12 }}>
                  YouTube → Claude AI → Twitter + Telegram
                </div>
              </div>
            </div>
          )}
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
