import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

// Attach JWT token to every request
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Logout on 401
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

  // Sidebar
  sidebarOpen: true,
  configPanelNode: null,

  // Flow handlers
  onNodesChange: (changes) =>
    set(s => ({ nodes: applyNodeChanges(changes, s.nodes) })),

  onEdgesChange: (changes) =>
    set(s => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (connection) =>
    set(s => ({ edges: addEdge({ ...connection, animated: true }, s.edges) })),

  setWorkflowName: (name) => set({ workflowName: name }),

  // Add a node from the catalog
  addNode: (nodeType, nodeMeta) => {
    // Short readable ID: e.g. "webhook1", "youtube1", "claude1", "telegram1"
    const baseName = nodeType.split('.').pop().split('_')[0];
    const existing = get().nodes.filter(n => n.data.nodeType === nodeType).length;
    const id = `${baseName}${existing + 1}`;
    const count = get().nodes.length;
    const lastNode = get().nodes[count - 1];
    const position = lastNode
      ? { x: lastNode.position.x + 240, y: lastNode.position.y }
      : { x: 80, y: 200 };

    // Pre-fill config with placeholder values so templates work out of the box
    const defaultConfig = {};
    (nodeMeta.fields || []).forEach(f => {
      if (f.placeholder) defaultConfig[f.key] = f.placeholder;
    });

    const newNode = {
      id,
      type: 'automationNode',
      position,
      data: {
        id,
        nodeType,
        label: nodeMeta.label,
        icon: nodeMeta.icon,
        color: nodeMeta.color,
        config: defaultConfig,
        fields: nodeMeta.fields,
      },
    };
    set(s => ({ nodes: [...s.nodes, newNode] }));
    return id;
  },

  // Update a node's config
  updateNodeConfig: (nodeId, key, value) => {
    set(s => ({
      nodes: s.nodes.map(n =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } }
          : n
      ),
    }));
  },

  openConfig: (node) => set({ configPanelNode: node }),
  closeConfig: () => set({ configPanelNode: null }),

  // Build workflow definition from flow graph
  _buildDefinition: () => {
    const { nodes, edges } = get();
    return {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.data.nodeType,
        config: n.data.config,
        position: n.position,
      })),
      connections: edges.map(e => ({ from: e.source, to: e.target })),
    };
  },

  // Save workflow to backend
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

  // Run workflow
  runWorkflow: async (triggerData = {}) => {
    const { workflowId, saveWorkflow, fetchExecutions } = get();
    set({ isRunning: true, lastExecution: null });
    try {
      await saveWorkflow();
      const id = get().workflowId;
      const res = await axios.post(`${API}/workflows/${id}/run`, triggerData);
      const execId = res.data.execution_id;

      // Poll until done
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

  // Load workflows list
  workflows: [],
  fetchWorkflows: async () => {
    const res = await axios.get(`${API}/workflows/`);
    set({ workflows: res.data });
  },

  fetchExecutions: async () => {
    const { workflowId } = get();
    if (!workflowId) return;
    const res = await axios.get(`${API}/workflows/${workflowId}/executions`);
    set({ executions: res.data });
  },

  // Load a workflow into the editor
  loadWorkflow: (wf) => {
    const nodes = (wf.definition?.nodes || []).map(n => ({
      id: n.id,
      type: 'automationNode',
      position: n.position || { x: 100, y: 100 },
      data: {
        id: n.id,
        nodeType: n.type,
        label: n.label || n.type,
        icon: n.icon || '⚙️',
        color: n.color || '#64748b',
        config: n.config || {},
        fields: n.fields || [],
      },
    }));
    const edges = (wf.definition?.connections || []).map((c, i) => ({
      id: `e${i}`,
      source: c.from,
      target: c.to,
      animated: true,
    }));
    set({ nodes, edges, workflowId: wf.id, workflowName: wf.name, lastExecution: null });
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
