import { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';

import { useStore } from './store';
import AutomationNode from './components/AutomationNode';
import NodeSidebar from './components/NodeSidebar';
import ConfigPanel from './components/ConfigPanel';
import ExecutionPanel from './components/ExecutionPanel';
import AuthPage from './components/AuthPage';

const API = import.meta.env.VITE_API_URL || '';
const nodeTypes = { automationNode: AutomationNode };

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check existing token on mount
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f1a', color: '#64748b', fontSize: 14 }}>
        Loading...
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
  const isSaving = useStore(s => s.isSaving);
  const workflowName = useStore(s => s.workflowName);
  const setWorkflowName = useStore(s => s.setWorkflowName);
  const configPanelNode = useStore(s => s.configPanelNode);

  const reactFlowWrapper = useRef(null);

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

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0f1a', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <NodeSidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{
          height: 48, background: '#13131f', borderBottom: '1px solid #ffffff10',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <input
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            style={{
              background: 'none', border: 'none', color: '#f1f5f9', fontSize: 14,
              fontWeight: 600, outline: 'none', width: 220,
            }}
          />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#64748b' }}>
            {nodes.length} nodes · {edges.length} connections
          </span>
          <span style={{ fontSize: 11, color: '#64748b', background: '#1e1e2e', padding: '4px 10px', borderRadius: 6 }}>
            {user.email}
          </span>
          <button
            onClick={saveWorkflow}
            disabled={isSaving}
            style={{
              background: '#1e1e2e', border: '1px solid #ffffff20', borderRadius: 6,
              color: isSaving ? '#64748b' : '#f1f5f9', padding: '5px 14px',
              cursor: isSaving ? 'default' : 'pointer', fontSize: 12,
            }}
          >
            {isSaving ? 'Saving…' : '💾 Save'}
          </button>
          <button
            onClick={onLogout}
            style={{
              background: 'none', border: '1px solid #ffffff15', borderRadius: 6,
              color: '#64748b', padding: '5px 10px', cursor: 'pointer', fontSize: 12,
            }}
          >
            Logout
          </button>
        </div>

        {/* Canvas */}
        <div ref={reactFlowWrapper} style={{ flex: 1 }}>
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
            deleteKeyCode="Delete"
            style={{ background: '#0f0f1a' }}
          >
            <Background variant={BackgroundVariant.Dots} color="#ffffff08" gap={20} />
            <Controls style={{ background: '#1e1e2e', border: '1px solid #ffffff10' }} />
            <MiniMap
              nodeColor={n => n.data?.color || '#6366f1'}
              style={{ background: '#13131f', border: '1px solid #ffffff10' }}
            />
          </ReactFlow>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 300, background: '#13131f', borderLeft: '1px solid #ffffff10',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {configPanelNode ? (
          <ConfigPanel />
        ) : (
          <>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #ffffff10' }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>▶ Run Workflow</div>
            </div>
            <ExecutionPanel />
          </>
        )}
      </div>
    </div>
  );
}
