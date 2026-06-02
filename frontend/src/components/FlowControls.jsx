import { useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';

// Renders inside <ReactFlow> so useReactFlow() works here.
// Handles shortcuts that require ReactFlow context (fitView).
export default function FlowControls() {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const handler = (e) => {
      // Ctrl+Shift+H  — fit / center view
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        fitView({ padding: 0.12, duration: 300 });
      }
      // Ctrl+Shift+F  — fit view (alternative)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        fitView({ padding: 0.12, duration: 300 });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fitView]);

  return null;
}
