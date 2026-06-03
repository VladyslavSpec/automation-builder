import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';

const cs = { background: '#ffffff10', padding: '1px 5px', borderRadius: 3, fontSize: 10, fontFamily: 'monospace', color: '#a5b4fc' };

const DOCS_DATA = {
  quickstart: {
    en: [
      ['1. Open the Nodes panel', 'Click the grid icon in the left rail (or use the sidebar) to see all available nodes grouped by category.'],
      ['2. Add a Trigger node', 'Drag a Webhook or Schedule node from the panel onto the canvas. Every workflow must start with a trigger.'],
      ['3. Add Action nodes', 'Drag any action node (YouTube, Telegram, Claude AI, etc.) next to the trigger.'],
      ['4. Connect nodes', 'Drag from the right-side handle (dot) of one node to the left-side handle of the next. The line shows data flow.'],
      ['5. Configure each node', 'Click any node to open the Config panel on the right. Fill in the required fields. Use {{template}} syntax to pass data from previous nodes.'],
      ['6. Save & Run', 'Press Ctrl+S to save, then Ctrl+Enter (or the Run button) to execute the workflow.'],
      ['7. Check results', 'The Execution panel on the right shows status per node: ✓ success, ✗ failed. Expand a node to see its output data.'],
    ],
    ru: [
      ['1. Открой панель нод', 'Нажми иконку сетки в левом рейле, чтобы увидеть все ноды, сгруппированные по категориям.'],
      ['2. Добавь триггер', 'Перетащи ноду Webhook или Schedule на холст. Каждый воркфлоу должен начинаться с триггера.'],
      ['3. Добавь ноды действий', 'Перетащи любую ноду действия (YouTube, Telegram, Claude AI и т.д.) рядом с триггером.'],
      ['4. Соедини ноды', 'Потяни от правого дота одной ноды к левому доту следующей. Линия показывает поток данных.'],
      ['5. Настрой каждую ноду', 'Нажми на ноду, чтобы открыть панель конфигурации справа. Заполни поля. Используй синтаксис {{шаблон}} для передачи данных из предыдущих нод.'],
      ['6. Сохрани и запусти', 'Нажми Ctrl+S для сохранения, затем Ctrl+Enter (или кнопку Run) для выполнения.'],
      ['7. Проверь результаты', 'Панель выполнения справа показывает статус каждой ноды: ✓ успех, ✗ ошибка. Разверни ноду для просмотра её выходных данных.'],
    ],
  },
  templates: {
    rows: [
      { syntax: '{{trigger.field}}',   en: 'Data from the trigger event (webhook body fields, schedule time)',            ru: 'Данные триггера (поля тела вебхука, время расписания)' },
      { syntax: '{{nodeId.field}}',    en: 'Output from another node. Example: {{youtube1.title}}',                       ru: 'Выход другой ноды. Пример: {{youtube1.title}}' },
      { syntax: '{{vars.name}}',       en: 'Variable set by a Set Variable node upstream',                                ru: 'Переменная, установленная нодой Set Variable' },
      { syntax: '{{env.KEY}}',         en: 'API key saved in Settings → Integrations. Example: {{env.TG_TOKEN}}',         ru: 'API ключ из Настройки → Интеграции. Пример: {{env.TG_TOKEN}}' },
    ],
    tipEn: 'Templates resolve at runtime. If a field is missing, the node may fail — check the Execution panel for details.',
    tipRu: 'Шаблоны вычисляются во время выполнения. Если поле отсутствует, нода может завершиться с ошибкой — проверь панель выполнения.',
  },
  nodeRef: {
    cats: [
      { name: 'Triggers',       color: '#6366f1', nodes: ['Webhook — fires when your URL receives a POST request', 'Schedule — fires on a cron expression (see Scheduling tab)'] },
      { name: 'YouTube',        color: '#ef4444', nodes: ['Get Video — fetch title, description, stats by video ID', 'Latest Video — get newest video from a channel', 'Channel Stats — subscriber count, views, video count'] },
      { name: 'Telegram',       color: '#0ea5e9', nodes: ['Send Message — text message to any chat/channel', 'Send Photo — image with optional caption', 'Send Document — any file URL with caption'] },
      { name: 'AI',             color: '#a855f7', nodes: ['Claude AI — Anthropic models (claude-haiku-4-5, claude-sonnet-4-6, claude-opus-4-8)', 'OpenAI GPT — gpt-4o, gpt-4o-mini, etc.'] },
      { name: 'Twitter / X',    color: '#e2e8f0', nodes: ['Post Tweet — single tweet (280 chars)', 'Post Thread — multiple tweets split by |||'] },
      { name: 'Notion',         color: '#f59e0b', nodes: ['Create Page — add a page to a database', 'Append Block — add text block to existing page', 'Query Database — filter/sort and return rows'] },
      { name: 'Google Sheets',  color: '#22c55e', nodes: ['Append Row — add a row at the bottom', 'Read Range — read cells (e.g. Sheet1!A1:D10)'] },
      { name: 'Logic',          color: '#64748b', nodes: ['HTTP Request — call any external API (GET/POST)', 'Delay — pause execution for N seconds', 'Log — print a value to the execution log', 'Set Variable — store a value for later nodes', 'Condition — branch based on a comparison (gt/lt/eq/contains)'] },
    ],
  },
  webhook: {
    en: {
      steps: [
        'Add a Webhook Trigger node to the canvas.',
        'Set a unique token in its config (e.g. "my-youtube-alert").',
        'Save the workflow (Ctrl+S).',
        'Send a POST request to your FlowBuilder URL:',
        'The JSON body is available in downstream nodes as {{trigger.FIELD}}.',
        'Rate limit: 30 requests/minute per token.',
      ],
      url: 'POST https://your-app.railway.app/webhook/YOUR_TOKEN',
      example: '{"video_id": "dQw4w9WgXcQ", "title": "My Video"}',
    },
    ru: {
      steps: [
        'Добавь ноду Webhook Trigger на холст.',
        'Укажи уникальный токен в конфиге (например, "my-youtube-alert").',
        'Сохрани воркфлоу (Ctrl+S).',
        'Отправь POST запрос на URL FlowBuilder:',
        'JSON тело доступно в следующих нодах как {{trigger.ПОЛЕ}}.',
        'Лимит: 30 запросов/мин на токен.',
      ],
      url: 'POST https://your-app.railway.app/webhook/YOUR_TOKEN',
      example: '{"video_id": "dQw4w9WgXcQ", "title": "Моё видео"}',
    },
  },
  scheduling: {
    rows: [
      { cron: '0 9 * * *',     en: 'Every day at 09:00 UTC',          ru: 'Каждый день в 09:00 UTC'         },
      { cron: '0 */6 * * *',   en: 'Every 6 hours',                   ru: 'Каждые 6 часов'                  },
      { cron: '0 9 * * 1',     en: 'Every Monday at 09:00 UTC',       ru: 'Каждый понедельник в 09:00 UTC'  },
      { cron: '30 18 * * 1-5', en: 'Mon–Fri at 18:30 UTC',            ru: 'Пн–Пт в 18:30 UTC'              },
      { cron: '0 0 1 * *',     en: 'First day of each month',         ru: 'Первый день каждого месяца'      },
      { cron: '*/15 * * * *',  en: 'Every 15 minutes',                ru: 'Каждые 15 минут'                 },
    ],
    noteEn: 'All times are UTC. Add offset in your cron if needed. Minimum interval: 1 minute.',
    noteRu: 'Всё время в UTC. При необходимости добавь смещение в cron. Минимальный интервал: 1 минута.',
  },
  faq: {
    items: [
      {
        q: { en: 'Where are my API keys stored?',               ru: 'Где хранятся мои API ключи?' },
        a: { en: 'Server-side, linked to your account. Not in the browser. They are never exposed in responses.',
             ru: 'На сервере, привязаны к вашему аккаунту. Не в браузере. Никогда не попадают в ответы.' },
      },
      {
        q: { en: 'Can I have multiple workflows?',              ru: 'Можно ли иметь несколько воркфлоу?' },
        a: { en: 'Yes — open the Workflows panel (list icon) to create, switch, rename, or delete workflows.',
             ru: 'Да — откройте панель Воркфлоу (иконка списка), чтобы создавать, переключать, переименовывать или удалять воркфлоу.' },
      },
      {
        q: { en: 'What happens when a node fails?',             ru: 'Что происходит при ошибке в ноде?' },
        a: { en: 'Execution stops at the failed node. Other branches already running finish. Check the Execution panel for the exact error.',
             ru: 'Выполнение останавливается на ноде с ошибкой. Другие ветки, уже запущенные, завершаются. Проверь панель выполнения для точной ошибки.' },
      },
      {
        q: { en: 'How do I test a webhook locally?',            ru: 'Как протестировать вебхук локально?' },
        a: { en: 'Run the app locally (see README). Use ngrok or curl to send a POST request to http://localhost:8002/webhook/YOUR_TOKEN.',
             ru: 'Запусти приложение локально. Используй ngrok или curl для отправки POST запроса на http://localhost:8002/webhook/YOUR_TOKEN.' },
      },
      {
        q: { en: 'Is there a run limit on the Free plan?',      ru: 'Есть ли лимит запусков на бесплатном плане?' },
        a: { en: '100 runs/month. Upgrade to Solo ($12/mo) or Pro ($39/mo) for more.',
             ru: '100 запусков/месяц. Upgrade на Solo ($12/мес) или Pro ($39/мес) для большего.' },
      },
      {
        q: { en: 'Can I chain multiple AI calls?',              ru: 'Можно ли цепочкой делать несколько AI вызовов?' },
        a: { en: 'Yes. Use {{node1.text}} as prompt input in node2. The output of any node is available to all downstream nodes.',
             ru: 'Да. Используй {{node1.text}} как ввод промпта в node2. Выход любой ноды доступен всем следующим нодам.' },
      },
    ],
  },
};

function Section({ title, open, onToggle, children }) {
  return (
    <div style={{ borderBottom: '1px solid #ffffff08' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '10px 12px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', color: '#cbd5e1', fontSize: 12, fontWeight: 600, textAlign: 'left',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#ffffff08'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        {title}
        <span style={{
          fontSize: 10, color: '#475569',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s', display: 'inline-block', flexShrink: 0,
        }}>▶</span>
      </button>
      {open && <div style={{ padding: '0 12px 14px' }}>{children}</div>}
    </div>
  );
}

export default function DocsPanel() {
  const lang = useStore(s => s.lang);
  const [open, setOpen] = useState({ quickstart: true });
  const toggle = key => setOpen(s => ({ ...s, [key]: !s[key] }));

  const L = (enStr, ruStr) => (lang === 'ru' ? ruStr : enStr);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid #ffffff10', flexShrink: 0 }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>{t('docs.title', lang)}</div>
        <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>
          {L('Step-by-step guide to building automations', 'Пошаговое руководство по построению автоматизаций')}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>

        {/* Quick Start */}
        <Section title={t('docs.quickstart', lang)} open={!!open.quickstart} onToggle={() => toggle('quickstart')}>
          {(DOCS_DATA.quickstart[lang] || DOCS_DATA.quickstart.en).map(([step, desc], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#6366f115',
                border: '1px solid #6366f130', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: '#6366f1', fontWeight: 700, flexShrink: 0, marginTop: 1,
              }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600, marginBottom: 2 }}>{step}</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </Section>

        {/* Template Syntax */}
        <Section title={t('docs.templates', lang)} open={!!open.templates} onToggle={() => toggle('templates')}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10, lineHeight: 1.5 }}>
            {L('Pass data between nodes using double-brace templates:', 'Передавай данные между нодами с помощью шаблонов в двойных скобках:')}
          </div>
          {DOCS_DATA.templates.rows.map(row => (
            <div key={row.syntax} style={{ marginBottom: 10, padding: '8px 10px', background: '#ffffff05', borderRadius: 6, border: '1px solid #ffffff08' }}>
              <code style={{ ...cs, display: 'inline-block', marginBottom: 4, fontSize: 11 }}>{row.syntax}</code>
              <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>{lang === 'ru' ? row.ru : row.en}</div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: '#475569', marginTop: 4, padding: '6px 8px', background: '#f59e0b08', borderRadius: 4, border: '1px solid #f59e0b15' }}>
            ⚠ {lang === 'ru' ? DOCS_DATA.templates.tipRu : DOCS_DATA.templates.tipEn}
          </div>
        </Section>

        {/* Node Reference */}
        <Section title={t('docs.nodeRef', lang)} open={!!open.nodeRef} onToggle={() => toggle('nodeRef')}>
          {DOCS_DATA.nodeRef.cats.map(cat => (
            <div key={cat.name} style={{ marginBottom: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, boxShadow: `0 0 5px ${cat.color}80`, flexShrink: 0 }}/>
                <div style={{ fontSize: 10, color: cat.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{cat.name}</div>
              </div>
              {cat.nodes.map(node => (
                <div key={node} style={{ fontSize: 10.5, color: '#64748b', paddingLeft: 12, marginBottom: 3, lineHeight: 1.4 }}>
                  · {node}
                </div>
              ))}
            </div>
          ))}
        </Section>

        {/* Webhook Setup */}
        <Section title={t('docs.webhook', lang)} open={!!open.webhook} onToggle={() => toggle('webhook')}>
          {(() => {
            const d = lang === 'ru' ? DOCS_DATA.webhook.ru : DOCS_DATA.webhook.en;
            return (
              <>
                {d.steps.map((step, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, marginBottom: i === 3 ? 6 : 3 }}>
                    {i + 1}. {step}
                  </div>
                ))}
                <code style={{
                  display: 'block', wordBreak: 'break-all',
                  background: '#ffffff08', borderRadius: 5, padding: '6px 8px',
                  fontSize: 10, color: '#a5b4fc', fontFamily: 'monospace', lineHeight: 1.5,
                  margin: '6px 0',
                }}>
                  {d.url}
                </code>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 4, marginBottom: 6 }}>
                  {L('Example body:', 'Пример тела запроса:')}
                </div>
                <code style={{
                  display: 'block',
                  background: '#ffffff08', borderRadius: 5, padding: '6px 8px',
                  fontSize: 10, color: '#86efac', fontFamily: 'monospace', lineHeight: 1.5,
                }}>
                  {d.example}
                </code>
              </>
            );
          })()}
        </Section>

        {/* Scheduling */}
        <Section title={t('docs.scheduling', lang)} open={!!open.scheduling} onToggle={() => toggle('scheduling')}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10, lineHeight: 1.5 }}>
            {L('Enter a 5-part cron expression in the Schedule Trigger config field.', 'Введи 5-частное cron выражение в поле конфига Schedule Trigger.')}
          </div>
          <div style={{ background: '#ffffff05', borderRadius: 6, overflow: 'hidden', border: '1px solid #ffffff08', marginBottom: 8 }}>
            <div style={{ display: 'flex', padding: '5px 8px', borderBottom: '1px solid #ffffff08', background: '#ffffff06' }}>
              <div style={{ flex: '0 0 110px', fontSize: 9, color: '#475569', fontFamily: 'monospace', fontWeight: 700 }}>CRON</div>
              <div style={{ fontSize: 9, color: '#475569', fontWeight: 700 }}>{L('MEANING', 'ЗНАЧЕНИЕ')}</div>
            </div>
            {DOCS_DATA.scheduling.rows.map(row => (
              <div key={row.cron} style={{ display: 'flex', padding: '5px 8px', borderBottom: '1px solid #ffffff05' }}>
                <code style={{ flex: '0 0 110px', fontSize: 10, color: '#a5b4fc', fontFamily: 'monospace' }}>{row.cron}</code>
                <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>{lang === 'ru' ? row.ru : row.en}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#334155' }}>
            {lang === 'ru' ? DOCS_DATA.scheduling.noteRu : DOCS_DATA.scheduling.noteEn}
          </div>
        </Section>

        {/* FAQ */}
        <Section title={t('docs.faq', lang)} open={!!open.faq} onToggle={() => toggle('faq')}>
          {DOCS_DATA.faq.items.map((item, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600, marginBottom: 3 }}>
                {item.q[lang] || item.q.en}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                {item.a[lang] || item.a.en}
              </div>
            </div>
          ))}
        </Section>

      </div>
    </div>
  );
}
