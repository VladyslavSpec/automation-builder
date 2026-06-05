import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import NodeSidebarPanel from './NodeSidebarPanel';
import WorkflowsPanel from './WorkflowsPanel';
import AccountPanel from './AccountPanel';
import SettingsPanel from './SettingsPanel';
import PlansPanel from './PlansPanel';
import DocsPanel from './DocsPanel';
import AIChatPanel from './AIChatPanel';

// Clean geometric SVG icons — 15×15 viewBox, stroke-based
const Icons = {
  ai: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1.5" y="2.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6 12.5l1.5-2 1.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="4.5" y1="5.5" x2="10.5" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="4.5" y1="7.8" x2="8" y2="7.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  nodes: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  workflows: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <line x1="2" y1="4"   x2="13" y2="4"   stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="2" y1="7.5" x2="13" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="2" y1="11"  x2="9"  y2="11"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  docs: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M3 1.5h5.5L12 5v8.5H3V1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M8.5 1.5V5H12" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="5" y1="7.5"  x2="10" y2="7.5"  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5" y1="10"   x2="10" y2="10"    stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  plans: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="4" width="13" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="1" y1="7.5" x2="14" y2="7.5" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="3.5" y1="10.2" x2="6.5" y2="10.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <line x1="2" y1="4"   x2="13" y2="4"   stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="2" y1="7.5" x2="13" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="2" y1="11"  x2="13" y2="11"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="5"   cy="4"   r="1.6" fill="#0f0f1a" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="9.5" cy="7.5" r="1.6" fill="#0f0f1a" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="6"   cy="11"  r="1.6" fill="#0f0f1a" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
};

const TOP_NAV_IDS    = ['nodes', 'ai', 'workflows', 'docs'];
const BOTTOM_NAV_IDS = ['plans', 'settings', 'account'];
const NAV_ICONS = { nodes: Icons.nodes, ai: Icons.ai, workflows: Icons.workflows, docs: Icons.docs, plans: Icons.plans, settings: Icons.settings };

export default function Sidebar({ user, onLogout }) {
  const active = useStore(s => s.activeSidebarPanel);
  const expanded = useStore(s => s.sidebarExpanded);
  const setActive = useStore(s => s.setActiveSidebarPanel);
  const lang = useStore(s => s.lang);
  const [tooltip, setTooltip] = useState(null);

  const initial = (user?.email || '?')[0].toUpperCase();

  const renderPanel = () => {
    switch (active) {
      case 'nodes':     return <NodeSidebarPanel />;
      case 'ai':        return <AIChatPanel />;
      case 'workflows': return <WorkflowsPanel />;
      case 'docs':      return <DocsPanel />;
      case 'settings':  return <SettingsPanel />;
      case 'plans':     return <PlansPanel user={user} />;
      case 'account':   return <AccountPanel user={user} onLogout={onLogout} />;
      default:          return <NodeSidebarPanel />;
    }
  };

  const btn = (id) => {
    const isActive = active === id;
    return {
      width: 48,
      height: 42,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
      position: 'relative',
      background: isActive ? '#ffffff0a' : 'transparent',
      borderLeft: `2px solid ${isActive ? '#6366f1' : 'transparent'}`,
      color: isActive ? '#e2e8f0' : '#475569',
      transition: 'color 0.1s, background 0.1s, border-color 0.1s',
    };
  };

  const NavBtn = ({ id, icon, label, children }) => (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setActive(id)}
        onMouseEnter={() => setTooltip(id)}
        onMouseLeave={() => setTooltip(null)}
        style={btn(id)}
      >
        {children || icon}
      </button>
      {tooltip === id && (
        <div style={{
          position: 'absolute', left: 52, top: '50%', transform: 'translateY(-50%)',
          background: '#1a1a2e', border: '1px solid #ffffff12', borderRadius: 4,
          padding: '4px 9px', fontSize: 11, color: '#cbd5e1', whiteSpace: 'nowrap',
          pointerEvents: 'none', zIndex: 999, letterSpacing: 0.2,
        }}>
          {label}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', flexShrink: 0 }}>
      {/* Icon rail */}
      <div style={{
        width: 48,
        background: '#0d0d1a',
        borderRight: '1px solid #ffffff0d',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', paddingTop: 4 }}>
          {TOP_NAV_IDS.map(id => (
            <NavBtn key={id} id={id} label={id === 'ai' ? 'AI Assistant' : t(`nav.${id}`, lang)} icon={NAV_ICONS[id]} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 10 }}>
          {BOTTOM_NAV_IDS.map(id => (
            <NavBtn key={id} id={id} label={id === 'account' ? (user?.email || 'Account') : t(`nav.${id}`, lang)} icon={NAV_ICONS[id]}>
              {id === 'account' && (
                <div style={{
                  width: 25, height: 25, borderRadius: '50%',
                  background: active === 'account' ? '#6366f1' : '#1e2a3a',
                  border: `1px solid ${active === 'account' ? '#6366f1' : '#ffffff18'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#e2e8f0',
                  letterSpacing: 0.5, transition: 'background 0.1s',
                }}>
                  {initial}
                </div>
              )}
            </NavBtn>
          ))}
        </div>
      </div>

      {/* Content panel */}
      <div style={{
        width: expanded ? 240 : 0,
        overflow: 'hidden',
        transition: 'width 0.18s ease',
        background: '#111118',
        borderRight: expanded ? '1px solid #ffffff0d' : 'none',
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
