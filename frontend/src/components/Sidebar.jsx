import { useState } from 'react';
import { useStore } from '../store';
import NodeSidebarPanel from './NodeSidebarPanel';
import WorkflowsPanel from './WorkflowsPanel';
import AccountPanel from './AccountPanel';
import SettingsPanel from './SettingsPanel';
import PlansPanel from './PlansPanel';
import DocsPanel from './DocsPanel';

const TOP_ICONS = [
  { id: 'nodes', icon: '⚡', label: 'Nodes' },
  { id: 'workflows', icon: '📋', label: 'Workflows' },
  { id: 'docs', icon: '📖', label: 'Docs' },
];

const BOTTOM_ICONS = [
  { id: 'plans', icon: '💎', label: 'Plans' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
  { id: 'account', icon: null, label: 'Account' }, // renders avatar letter instead
];

export default function Sidebar({ user, onLogout }) {
  const activeSidebarPanel = useStore(s => s.activeSidebarPanel);
  const sidebarExpanded = useStore(s => s.sidebarExpanded);
  const setActiveSidebarPanel = useStore(s => s.setActiveSidebarPanel);
  const [tooltip, setTooltip] = useState(null);

  const renderPanel = () => {
    switch (activeSidebarPanel) {
      case 'nodes': return <NodeSidebarPanel />;
      case 'workflows': return <WorkflowsPanel />;
      case 'docs': return <DocsPanel />;
      case 'settings': return <SettingsPanel />;
      case 'plans': return <PlansPanel user={user} />;
      case 'account': return <AccountPanel user={user} onLogout={onLogout} />;
      default: return <NodeSidebarPanel />;
    }
  };

  const initial = (user?.email || '?')[0].toUpperCase();

  const iconBtn = (id) => {
    const isActive = activeSidebarPanel === id;
    return {
      width: 48, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', border: 'none', position: 'relative',
      background: isActive ? '#ffffff0f' : 'transparent',
      borderLeft: `3px solid ${isActive ? '#6366f1' : 'transparent'}`,
      color: isActive ? '#f1f5f9' : '#64748b',
      fontSize: 16, transition: 'all 0.1s',
    };
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexShrink: 0 }}>
      {/* Icon rail */}
      <div style={{
        width: 48, background: '#0f0f1a', borderRight: '1px solid #ffffff10',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        flexShrink: 0, zIndex: 10,
      }}>
        {/* Top icons */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {TOP_ICONS.map(item => (
            <div key={item.id} style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveSidebarPanel(item.id)}
                onMouseEnter={() => setTooltip(item.id)}
                onMouseLeave={() => setTooltip(null)}
                style={iconBtn(item.id)}
              >
                {item.icon}
              </button>
              {tooltip === item.id && (
                <div style={{
                  position: 'absolute', left: 52, top: '50%', transform: 'translateY(-50%)',
                  background: '#1e1e2e', border: '1px solid #ffffff15', borderRadius: 5,
                  padding: '4px 8px', fontSize: 11, color: '#f1f5f9', whiteSpace: 'nowrap',
                  pointerEvents: 'none', zIndex: 999,
                }}>
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom icons */}
        <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 8 }}>
          {BOTTOM_ICONS.map(item => (
            <div key={item.id} style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveSidebarPanel(item.id)}
                onMouseEnter={() => setTooltip(item.id)}
                onMouseLeave={() => setTooltip(null)}
                style={iconBtn(item.id)}
              >
                {item.id === 'account' ? (
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: activeSidebarPanel === 'account' ? '#6366f1' : '#334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    transition: 'background 0.1s',
                  }}>
                    {initial}
                  </div>
                ) : item.icon}
              </button>
              {tooltip === item.id && (
                <div style={{
                  position: 'absolute', left: 52, top: '50%', transform: 'translateY(-50%)',
                  background: '#1e1e2e', border: '1px solid #ffffff15', borderRadius: 5,
                  padding: '4px 8px', fontSize: 11, color: '#f1f5f9', whiteSpace: 'nowrap',
                  pointerEvents: 'none', zIndex: 999,
                }}>
                  {item.id === 'account' ? (user?.email || 'Account') : item.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content panel */}
      <div style={{
        width: sidebarExpanded ? 240 : 0,
        overflow: 'hidden',
        transition: 'width 0.2s ease',
        background: '#13131f',
        borderRight: sidebarExpanded ? '1px solid #ffffff10' : 'none',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ width: 240, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}
