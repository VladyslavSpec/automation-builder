// Professional SVG icons for all node types
// 16×16 viewBox, stroke-based, inherits stroke/fill from parent SVG

const P = {
  'trigger.webhook': () => (
    <>
      <path d="M8 1.5l2 6H14L9.5 11l1.5 5L8 13.5 5 16l1.5-5L2 7.5h4L8 1.5Z"/>
    </>
  ),

  'trigger.schedule': () => (
    <>
      <circle cx="8" cy="8" r="6"/>
      <path d="M8 4.5V8l2.5 2"/>
    </>
  ),

  'action.youtube_get_video': () => (
    <>
      <rect x="1.5" y="3.5" width="13" height="9" rx="2"/>
      <path d="M6.5 5.5l5 2.5-5 2.5V5.5Z" fill="currentColor" stroke="none"/>
    </>
  ),

  'action.youtube_latest_video': () => (
    <>
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/>
      <line x1="5" y1="3.5" x2="5" y2="12.5"/>
      <line x1="11" y1="3.5" x2="11" y2="12.5"/>
      <line x1="1.5" y1="6.5" x2="5" y2="6.5"/>
      <line x1="11" y1="6.5" x2="14.5" y2="6.5"/>
      <line x1="1.5" y1="9.5" x2="5" y2="9.5"/>
      <line x1="11" y1="9.5" x2="14.5" y2="9.5"/>
    </>
  ),

  'action.youtube_channel_stats': () => (
    <>
      <path d="M3 14V9" strokeWidth="2.5" strokeLinecap="square"/>
      <path d="M7.5 14V5.5" strokeWidth="2.5" strokeLinecap="square"/>
      <path d="M12 14V2.5" strokeWidth="2.5" strokeLinecap="square"/>
      <line x1="1" y1="14" x2="15" y2="14"/>
    </>
  ),

  'action.telegram_send_message': () => (
    <>
      <path d="M14 2L1 7.5l4.5 2L14 2ZM5.5 9.5L7 14l2.5-4"/>
      <line x1="5.5" y1="9.5" x2="14" y2="2"/>
    </>
  ),

  'action.telegram_send_photo': () => (
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.5"/>
      <path d="M2 10.5l3.5-3.5 3 3 2-2L14 11"/>
      <circle cx="5.5" cy="6.5" r="1.3"/>
    </>
  ),

  'action.telegram_send_document': () => (
    <>
      <path d="M4 1.5h5.5L13 5V14.5H4V1.5Z"/>
      <path d="M9.5 1.5V5H13"/>
      <line x1="6" y1="7.5" x2="11" y2="7.5"/>
      <line x1="6" y1="10" x2="11" y2="10"/>
      <line x1="6" y1="12.5" x2="9" y2="12.5"/>
    </>
  ),

  'action.claude_generate': () => (
    <>
      <path d="M8 1.5l1.5 5L15 8l-5.5 1.5L8 15l-1.5-5.5L1 8l5.5-1.5L8 1.5Z"/>
    </>
  ),

  'action.openai_generate': () => (
    <>
      <line x1="8" y1="2" x2="8" y2="14"/>
      <line x1="3.07" y1="5" x2="12.93" y2="11"/>
      <line x1="3.07" y1="11" x2="12.93" y2="5"/>
    </>
  ),

  'action.twitter_post_tweet': () => (
    <>
      <path d="M3 3l10 10M13 3L3 13" strokeWidth="2"/>
    </>
  ),

  'action.twitter_post_thread': () => (
    <>
      <rect x="2" y="2" width="11" height="5.5" rx="1.5"/>
      <rect x="3" y="8.5" width="11" height="5.5" rx="1.5"/>
    </>
  ),

  'action.notion_create_page': () => (
    <>
      <path d="M4 1.5h5.5L13 5V14.5H4V1.5Z"/>
      <path d="M9.5 1.5V5H13"/>
      <path d="M7.5 9.5h1.5M8.25 8.75v1.5"/>
    </>
  ),

  'action.notion_append_block': () => (
    <>
      <path d="M4 1.5h5.5L13 5V14.5H4V1.5Z"/>
      <path d="M9.5 1.5V5H13"/>
      <path d="M6.5 10.5l1.5 1.5 1.5-1.5"/>
    </>
  ),

  'action.notion_query_database': () => (
    <>
      <ellipse cx="8" cy="4.5" rx="5.5" ry="2"/>
      <path d="M2.5 4.5v7c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-7"/>
      <path d="M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2"/>
    </>
  ),

  'action.sheets_append_row': () => (
    <>
      <rect x="2" y="2" width="12" height="12" rx="1.5"/>
      <line x1="2" y1="6.5" x2="14" y2="6.5"/>
      <line x1="2" y1="10" x2="14" y2="10"/>
      <line x1="6.5" y1="2" x2="6.5" y2="14"/>
      <line x1="10" y1="2" x2="10" y2="14"/>
    </>
  ),

  'action.sheets_read_range': () => (
    <>
      <rect x="2" y="2" width="9" height="9" rx="1.5"/>
      <line x1="2" y1="6" x2="11" y2="6"/>
      <line x1="6" y1="2" x2="6" y2="11"/>
      <circle cx="12.5" cy="12.5" r="2"/>
      <line x1="14" y1="14" x2="15.5" y2="15.5"/>
    </>
  ),

  'action.log': () => (
    <>
      <rect x="2" y="2.5" width="12" height="11" rx="1.5"/>
      <path d="M5 6.5l2.5 1.5L5 9.5"/>
      <line x1="9" y1="9.5" x2="12" y2="9.5"/>
    </>
  ),

  'action.delay': () => (
    <>
      <path d="M4 2h8M4 14h8"/>
      <path d="M4.5 2C4.5 6 11.5 8 11.5 8S4.5 10 4.5 14"/>
      <path d="M11.5 2C11.5 6 4.5 8 4.5 8S11.5 10 11.5 14"/>
    </>
  ),

  'action.http_request': () => (
    <>
      <circle cx="8" cy="8" r="6"/>
      <ellipse cx="8" cy="8" rx="2.5" ry="6"/>
      <line x1="2" y1="8" x2="14" y2="8"/>
    </>
  ),

  'transform.set_variable': () => (
    <>
      <path d="M5.5 2H4a1.5 1.5 0 00-1.5 1.5v2.5A1.5 1.5 0 011 7.5a1.5 1.5 0 011.5 1.5v2.5A1.5 1.5 0 004 13H5.5"/>
      <path d="M10.5 2H12a1.5 1.5 0 011.5 1.5v2.5A1.5 1.5 0 0115 7.5a1.5 1.5 0 01-1.5 1.5v2.5A1.5 1.5 0 0112 13h-1.5"/>
      <circle cx="8" cy="7.5" r="1" fill="currentColor" stroke="none"/>
    </>
  ),

  'logic.condition': () => (
    <>
      <path d="M8 2.5l5 5.5-5 5.5-5-5.5L8 2.5Z"/>
      <line x1="8" y1="13.5" x2="8" y2="15"/>
      <path d="M3 8l-2 4"/>
      <path d="M13 8l2 4"/>
    </>
  ),

  default: () => (
    <>
      <circle cx="8" cy="8" r="5.5"/>
      <circle cx="8" cy="8" r="2"/>
    </>
  ),
};

export function NodeIcon({ type, size = 16, color = 'currentColor', className }) {
  const Icon = P[type] || P.default;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <Icon />
    </svg>
  );
}
