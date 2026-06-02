import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

// ─── helpers ─────────────────────────────────────────────────────────────────
const snapshot = (s) => ({ nodes: s.nodes, edges: s.edges });
const pushHistory = (s) => ({
  history: [...s.history.slice(-39), snapshot(s)],
  historyFuture: [],
});

export const useStore = create(persist((set, get) => ({
  // Flow state
  nodes: [],
  edges: [],
  selectedNode: null,

  // Workflow meta
  workflowId: null,
  workflowName: 'Untitled Workflow',
  isSaving: false,
  isRunning: false,
  lastExecution: null,
  executions: [],

  // Sidebar navigation
  activeSidebarPanel: 'nodes',
  sidebarExpanded: true,
  sidebarOpen: true,
  configPanelNode: null,

  // Workflows list
  workflows: [],
  workflowsLoading: false,

  // API keys (server-side)
  apiKeys: {},
  apiKeysSaving: false,
  apiKeysLoaded: false,

  // Undo / Redo history
  history: [],
  historyFuture: [],

  // Copy / Paste clipboard
  clipboard: [],

  // ─── Flow handlers ────────────────────────────────────────────────────────
  onNodesChange: (changes) => {
    const hasRemoval = changes.some(c => c.type === 'remove');
    if (hasRemoval) set(s => pushHistory(s));
    set(s => ({ nodes: applyNodeChanges(changes, s.nodes) }));
  },

  onEdgesChange: (changes) => {
    const hasRemoval = changes.some(c => c.type === 'remove');
    if (hasRemoval) set(s => pushHistory(s));
    set(s => ({ edges: applyEdgeChanges(changes, s.edges) }));
  },

  onConnect: (connection) => set(s => ({
    ...pushHistory(s),
    edges: addEdge({ ...connection, animated: true }, s.edges),
  })),

  setWorkflowName: (name) => set({ workflowName: name }),

  // ─── Sidebar ──────────────────────────────────────────────────────────────
  setActiveSidebarPanel: (panel) => set(s => ({
    activeSidebarPanel: panel,
    sidebarExpanded: s.activeSidebarPanel === panel ? !s.sidebarExpanded : true,
  })),

  openConfig: (node) => set({ configPanelNode: node }),
  closeConfig: () => set({ configPanelNode: null }),

  // ─── Node CRUD ────────────────────────────────────────────────────────────
  addNode: (nodeType, nodeMeta) => {
    set(s => pushHistory(s));

    const baseName = nodeType.split('.').pop().split('_')[0];
    const s = get();
    const existing = s.nodes.filter(n => n.data.nodeType === nodeType).length;
    const id = `${baseName}${existing + 1}`;
    const lastNode = s.nodes[s.nodes.length - 1];
    const position = lastNode
      ? { x: lastNode.position.x + 240, y: lastNode.position.y }
      : { x: 80, y: 200 };

    const defaultConfig = {};
    (nodeMeta.fields || []).forEach(f => {
      if (f.placeholder) defaultConfig[f.key] = f.placeholder;
    });

    const newNode = {
      id,
      type: 'automationNode',
      position,
      data: { id, nodeType, label: nodeMeta.label, icon: nodeMeta.icon, color: nodeMeta.color, config: defaultConfig, fields: nodeMeta.fields },
    };
    set(s2 => ({ nodes: [...s2.nodes, newNode] }));
    return id;
  },

  updateNodeConfig: (nodeId, key, value) => set(s => ({
    nodes: s.nodes.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } } : n
    ),
  })),

  deleteNode: (nodeId) => set(s => ({
    ...pushHistory(s),
    nodes: s.nodes.filter(n => n.id !== nodeId),
    edges: s.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    configPanelNode: s.configPanelNode?.id === nodeId ? null : s.configPanelNode,
  })),

  // Deletes all selected nodes AND edges
  deleteSelected: () => set(s => {
    const nodeIds = new Set(s.nodes.filter(n => n.selected).map(n => n.id));
    const edgeIds = new Set(s.edges.filter(e => e.selected).map(e => e.id));
    if (nodeIds.size === 0 && edgeIds.size === 0) return {};
    return {
      ...pushHistory(s),
      nodes: s.nodes.filter(n => !nodeIds.has(n.id)),
      edges: s.edges.filter(e => !edgeIds.has(e.id) && !nodeIds.has(e.source) && !nodeIds.has(e.target)),
      configPanelNode: nodeIds.has(s.configPanelNode?.id) ? null : s.configPanelNode,
    };
  }),

  selectAll: () => set(s => ({
    nodes: s.nodes.map(n => ({ ...n, selected: true })),
  })),

  duplicateSelected: () => {
    const s = get();
    const selected = s.nodes.filter(n => n.selected);
    if (selected.length === 0) return;
    set(s2 => pushHistory(s2));

    const newNodes = selected.map(n => {
      const baseName = n.data.nodeType.split('.').pop().split('_')[0];
      const count = get().nodes.filter(x => x.data.nodeType === n.data.nodeType).length;
      const newId = `${baseName}${count + 1}`;
      return {
        ...n,
        id: newId,
        position: { x: n.position.x + 40, y: n.position.y + 40 },
        selected: true,
        data: { ...n.data, id: newId },
      };
    });

    set(s2 => ({
      nodes: [...s2.nodes.map(n => ({ ...n, selected: false })), ...newNodes],
    }));
  },

  copySelected: () => {
    const selected = get().nodes.filter(n => n.selected);
    if (selected.length) set({ clipboard: selected });
  },

  pasteClipboard: () => {
    const s = get();
    if (s.clipboard.length === 0) return;
    set(s2 => pushHistory(s2));

    const newNodes = s.clipboard.map(n => {
      const baseName = n.data.nodeType.split('.').pop().split('_')[0];
      const count = get().nodes.filter(x => x.data.nodeType === n.data.nodeType).length;
      const newId = `${baseName}${count + 1}`;
      return {
        ...n,
        id: newId,
        position: { x: n.position.x + 50, y: n.position.y + 50 },
        selected: true,
        data: { ...n.data, id: newId },
      };
    });

    set(s2 => ({
      nodes: [...s2.nodes.map(n => ({ ...n, selected: false })), ...newNodes],
    }));
  },

  // ─── Undo / Redo ──────────────────────────────────────────────────────────
  undo: () => {
    const s = get();
    if (s.history.length === 0) return;
    const prev = s.history[s.history.length - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      history: s.history.slice(0, -1),
      historyFuture: [snapshot(s), ...s.historyFuture.slice(0, 39)],
      configPanelNode: null,
    });
  },

  redo: () => {
    const s = get();
    if (s.historyFuture.length === 0) return;
    const next = s.historyFuture[0];
    set({
      nodes: next.nodes,
      edges: next.edges,
      history: [...s.history.slice(-39), snapshot(s)],
      historyFuture: s.historyFuture.slice(1),
      configPanelNode: null,
    });
  },

  // ─── Build / Save / Run ───────────────────────────────────────────────────
  _buildDefinition: () => {
    const { nodes, edges } = get();
    return {
      nodes: nodes.map(n => ({ id: n.id, type: n.data.nodeType, config: n.data.config, position: n.position })),
      connections: edges.map(e => ({ from: e.source, to: e.target })),
    };
  },

  saveWorkflow: async () => {
    const { workflowId, workflowName, _buildDefinition } = get();
    set({ isSaving: true });
    try {
      const definition = _buildDefinition();
      if (workflowId) {
        await axios.put(`${API}/workflows/${workflowId}`, { name: workflowName, definition });
      } else {
        const res = await axios.post(`${API}/workflows/`, { name: workflowName, definition });
        set({ workflowId: res.data.id });
      }
    } finally {
      set({ isSaving: false });
    }
  },

  runWorkflow: async (triggerData = {}) => {
    const { workflowId, saveWorkflow, fetchExecutions } = get();
    set({ isRunning: true, lastExecution: null });
    try {
      await saveWorkflow();
      const id = get().workflowId;
      const res = await axios.post(`${API}/workflows/${id}/run`, triggerData);
      const execId = res.data.execution_id;

      let exec;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 1000));
        exec = (await axios.get(`${API}/executions/${execId}`)).data;
        if (exec.status === 'success' || exec.status === 'failed') break;
      }

      const nodeExecs = (await axios.get(`${API}/executions/${execId}/nodes`)).data;
      set({ lastExecution: { ...exec, nodes: nodeExecs } });
      fetchExecutions();
    } finally {
      set({ isRunning: false });
    }
  },

  // ─── Workflows list ───────────────────────────────────────────────────────
  fetchWorkflows: async () => {
    set({ workflowsLoading: true });
    try {
      const res = await axios.get(`${API}/workflows/`);
      set({ workflows: res.data });
    } finally {
      set({ workflowsLoading: false });
    }
  },

  deleteWorkflow: async (id) => {
    await axios.delete(`${API}/workflows/${id}`);
    set(s => ({ workflows: s.workflows.filter(w => w.id !== id) }));
    if (get().workflowId === id) {
      set({ nodes: [], edges: [], workflowId: null, workflowName: 'Untitled Workflow', lastExecution: null, executions: [], configPanelNode: null });
    }
  },

  newWorkflow: () => {
    set({ nodes: [], edges: [], workflowId: null, workflowName: 'Untitled Workflow', lastExecution: null, executions: [], configPanelNode: null, history: [], historyFuture: [] });
  },

  fetchExecutions: async () => {
    const { workflowId } = get();
    if (!workflowId) return;
    const res = await axios.get(`${API}/workflows/${workflowId}/executions`);
    set({ executions: res.data });
  },

  loadWorkflow: (wf) => {
    const nodes = (wf.definition?.nodes || []).map(n => ({
      id: n.id, type: 'automationNode', position: n.position || { x: 100, y: 100 },
      data: { id: n.id, nodeType: n.type, label: n.label || n.type, icon: n.icon || '⚙️', color: n.color || '#64748b', config: n.config || {}, fields: n.fields || [] },
    }));
    const edges = (wf.definition?.connections || []).map((c, i) => ({
      id: `e${i}`, source: c.from, target: c.to, animated: true,
    }));
    set({ nodes, edges, workflowId: wf.id, workflowName: wf.name, lastExecution: null, history: [], historyFuture: [] });
  },

  // ─── API keys ─────────────────────────────────────────────────────────────
  fetchApiKeys: async () => {
    try {
      const res = await axios.get(`${API}/auth/settings`);
      set({ apiKeys: res.data.api_keys || {}, apiKeysLoaded: true });
    } catch { set({ apiKeysLoaded: true }); }
  },

  saveApiKeys: async (keys) => {
    set({ apiKeysSaving: true });
    try {
      await axios.put(`${API}/auth/settings`, { api_keys: keys });
      set({ apiKeys: keys });
    } finally { set({ apiKeysSaving: false }); }
  },
}), {
  name: 'automation-builder-state',
  partialize: (state) => ({
    nodes: state.nodes,
    edges: state.edges,
    workflowId: state.workflowId,
    workflowName: state.workflowName,
  }),
}));
