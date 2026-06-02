import { useState } from 'react';

const SECTIONS = [
  {
    key: 'quickstart',
    title: 'Quick Start',
    content: (
      <ol style={{ margin: 0, paddingLeft: 16 }}>
        {[
          'Drag a Trigger node (Webhook or Schedule) from the Nodes panel onto the canvas.',
          'Drag an Action node and drop it next to the trigger.',
          'Connect them by dragging from the output handle to the input handle.',
          'Click any node to open the config panel on the right — fill in the required fields.',
          'Click 💾 Save, then ▶ Run to execute.',
          'Check the Execution panel (right side) to see results per node.',
        ].map((step, i) => (
          <li key={i} style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, lineHeight: 1.5 }}>
            {step}
          </li>
        ))}
      </ol>
    ),
  },
  {
    key: 'templates',
    title: 'Template Syntax',
    content: (
      <div>
        <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, marginTop: 0 }}>
          Use <code style={codeStyle}>{'{{source.field}}'}</code> in any config value:
        </p>
        {[
          ['{{trigger.field}}', 'Data from the trigger event (webhook body, schedule time, etc.)'],
          ['{{nodeId.field}}', 'Output from another node. E.g. {{youtube1.title}}'],
          ['{{vars.name}}', 'Variables set by a Set Variable node'],
          ['{{env.KEY}}', 'API keys saved in Settings panel (e.g. {{env.TG_TOKEN}})'],
        ].map(([syntax, desc]) => (
          <div key={syntax} style={{ marginBottom: 8 }}>
            <code style={{ ...codeStyle, display: 'inline-block', marginBottom: 2 }}>{syntax}</code>
            <div style={{ fontSize: 10, color: '#64748b', paddingLeft: 2 }}>{desc}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: 'nodes',
    title: 'Node Reference',
    content: (
      <div>
        {[
          { cat: 'Triggers', items: ['Webhook — fires on HTTP POST', 'Schedule — fires on cron schedule'] },
          { cat: 'YouTube', items: ['Get Video, Latest Video, Channel Stats'] },
          { cat: 'Telegram', items: ['Send Message, Send Photo, Send Document'] },
          { cat: 'AI', items: ['Claude AI (Anthropic), OpenAI GPT'] },
          { cat: 'Twitter/X', items: ['Post Tweet, Post Thread'] },
          { cat: 'Notion', items: ['Create Page, Append Block, Query Database'] },
          { cat: 'Google Sheets', items: ['Append Row, Read Range'] },
          { cat: 'Logic', items: ['HTTP Request, Delay, Log, Set Variable, Condition'] },
        ].map(({ cat, items }) => (
          <div key={cat} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {cat}
            </div>
            {items.map(item => (
              <div key={item} style={{ fontSize: 11, color: '#94a3b8', paddingLeft: 8, marginBottom: 2 }}>
                · {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    key: 'webhook',
    title: 'Webhook Setup',
    content: (
      <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.7 }}>
        <p style={{ marginTop: 0 }}>
          1. Add a <strong style={{ color: '#cbd5e1' }}>Webhook Trigger</strong> node.<br />
          2. Set a unique <strong style={{ color: '#cbd5e1' }}>token</strong> in its config.<br />
          3. Save the workflow.<br />
          4. Send a POST request to:
        </p>
        <code style={{ ...codeStyle, display: 'block', wordBreak: 'break-all', lineHeight: 1.5 }}>
          POST /webhook/YOUR_TOKEN
        </code>
        <p>Body JSON will be available as <code style={codeStyle}>{'{{trigger.field}}'}</code> in downstream nodes.</p>
        <p style={{ marginBottom: 0 }}>Rate limit: 30 requests/minute per token.</p>
      </div>
    ),
  },
  {
    key: 'faq',
    title: 'FAQ',
    content: (
      <div>
        {[
          ['Where are my API keys stored?', 'On the server, linked to your account. They are not stored in localStorage.'],
          ['Can I have multiple workflows?', 'Yes — use the Workflows panel (📋 icon) to create, load, and delete workflows.'],
          ['How do I connect nodes?', 'Drag from the small dot on the right edge of a node to the left dot of another.'],
          ['What happens if a node fails?', 'The execution stops at the failed node. Check the Execution panel for the error message.'],
          ['Is there a run limit?', 'On the Free plan, 100 runs/month. Upgrade for more.'],
        ].map(([q, a]) => (
          <div key={q} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600, marginBottom: 3 }}>{q}</div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{a}</div>
          </div>
        ))}
      </div>
    ),
  },
];

const codeStyle = { background: '#ffffff10', padding: '1px 5px', borderRadius: 3, fontSize: 10, fontFamily: 'monospace', color: '#a5b4fc' };

export default function DocsPanel() {
  const [open, setOpen] = useState({ quickstart: true });

  const toggle = key => setOpen(s => ({ ...s, [key]: !s[key] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid #ffffff10', flexShrink: 0 }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>Documentation</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {SECTIONS.map(section => (
          <div key={section.key} style={{ borderBottom: '1px solid #ffffff08' }}>
            <button
              onClick={() => toggle(section.key)}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 12px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', color: '#cbd5e1', fontSize: 12, fontWeight: 600, textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#ffffff08'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {section.title}
              <span style={{
                fontSize: 10, color: '#475569',
                transform: open[section.key] ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
                display: 'inline-block',
              }}>▶</span>
            </button>
            {open[section.key] && (
              <div style={{ padding: '0 12px 12px' }}>
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
