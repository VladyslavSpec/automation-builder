export const NODE_CATALOG = [
  {
    category: "Triggers",
    nodes: [
      { type: "trigger.webhook",  label: "Webhook",  color: "#6366f1", icon: "", fields: [{ key: "token", label: "Token", placeholder: "auto-generated" }] },
      { type: "trigger.schedule", label: "Schedule", color: "#6366f1", icon: "", fields: [{ key: "cron", label: "Cron expression", placeholder: "0 9 * * *" }] },
    ],
  },
  {
    category: "YouTube",
    nodes: [
      { type: "action.youtube_get_video",    label: "Get Video",     color: "#ef4444", icon: "", fields: [{ key: "video_id", label: "Video ID", placeholder: "{{trigger.video_id}}" }, { key: "api_key", label: "API Key", placeholder: "{{env.YOUTUBE_API_KEY}}" }] },
      { type: "action.youtube_latest_video", label: "Latest Video",  color: "#ef4444", icon: "", fields: [{ key: "channel_id", label: "Channel ID", placeholder: "UCxxxxxx" }, { key: "api_key", label: "API Key", placeholder: "{{env.YOUTUBE_API_KEY}}" }, { key: "max_results", label: "Max Results", placeholder: "1" }] },
      { type: "action.youtube_channel_stats",label: "Channel Stats", color: "#ef4444", icon: "", fields: [{ key: "channel_id", label: "Channel ID", placeholder: "UCxxxxxx" }, { key: "api_key", label: "API Key", placeholder: "{{env.YOUTUBE_API_KEY}}" }] },
    ],
  },
  {
    category: "Telegram",
    nodes: [
      { type: "action.telegram_send_message",  label: "Send Message",  color: "#0ea5e9", icon: "", fields: [{ key: "bot_token", label: "Bot Token", placeholder: "{{env.TG_TOKEN}}" }, { key: "chat_id", label: "Chat ID", placeholder: "690386024" }, { key: "text", label: "Text", placeholder: "Hello {{n1.title}}", textarea: true }] },
      { type: "action.telegram_send_photo",    label: "Send Photo",    color: "#0ea5e9", icon: "", fields: [{ key: "bot_token", label: "Bot Token", placeholder: "{{env.TG_TOKEN}}" }, { key: "chat_id", label: "Chat ID", placeholder: "690386024" }, { key: "photo_url", label: "Photo URL", placeholder: "{{n1.thumbnail_url}}" }, { key: "caption", label: "Caption", placeholder: "{{n1.title}}" }] },
      { type: "action.telegram_send_document", label: "Send Document", color: "#0ea5e9", icon: "", fields: [{ key: "bot_token", label: "Bot Token", placeholder: "{{env.TG_TOKEN}}" }, { key: "chat_id", label: "Chat ID", placeholder: "690386024" }, { key: "document_url", label: "Document URL", placeholder: "" }, { key: "caption", label: "Caption", placeholder: "" }] },
    ],
  },
  {
    category: "AI",
    nodes: [
      { type: "action.claude_generate", label: "Claude AI",  color: "#a855f7", icon: "", fields: [{ key: "api_key", label: "API Key", placeholder: "{{env.ANTHROPIC_API_KEY}}" }, { key: "model", label: "Model", placeholder: "claude-haiku-4-5-20251001" }, { key: "prompt", label: "Prompt", placeholder: "Write a tweet about: {{n1.title}}", textarea: true }, { key: "max_tokens", label: "Max Tokens", placeholder: "1024" }] },
      { type: "action.openai_generate", label: "OpenAI GPT", color: "#a855f7", icon: "", fields: [{ key: "api_key", label: "API Key", placeholder: "{{env.OPENAI_API_KEY}}" }, { key: "model", label: "Model", placeholder: "gpt-4o-mini" }, { key: "prompt", label: "Prompt", placeholder: "Write a tweet about: {{n1.title}}", textarea: true }, { key: "max_tokens", label: "Max Tokens", placeholder: "1024" }] },
    ],
  },
  {
    category: "Twitter / X",
    nodes: [
      { type: "action.twitter_post_tweet",  label: "Post Tweet",  color: "#e2e8f0", icon: "", fields: [{ key: "consumer_key", label: "Consumer Key", placeholder: "" }, { key: "consumer_secret", label: "Consumer Secret", placeholder: "" }, { key: "access_token", label: "Access Token", placeholder: "" }, { key: "access_token_secret", label: "Token Secret", placeholder: "" }, { key: "text", label: "Tweet Text", placeholder: "{{n2.text}}", textarea: true }] },
      { type: "action.twitter_post_thread", label: "Post Thread", color: "#e2e8f0", icon: "", fields: [{ key: "consumer_key", label: "Consumer Key", placeholder: "" }, { key: "consumer_secret", label: "Consumer Secret", placeholder: "" }, { key: "access_token", label: "Access Token", placeholder: "" }, { key: "access_token_secret", label: "Token Secret", placeholder: "" }, { key: "tweets", label: "Tweets (split by |||)", placeholder: "Tweet 1 ||| Tweet 2 ||| Tweet 3", textarea: true }] },
    ],
  },
  {
    category: "Notion",
    nodes: [
      { type: "action.notion_create_page",    label: "Create Page",    color: "#f59e0b", icon: "", fields: [{ key: "api_key", label: "API Key", placeholder: "{{env.NOTION_API_KEY}}" }, { key: "database_id", label: "Database ID", placeholder: "" }, { key: "title", label: "Title", placeholder: "{{n1.title}}" }, { key: "content", label: "Content", placeholder: "{{n1.description}}", textarea: true }] },
      { type: "action.notion_append_block",   label: "Append Block",   color: "#f59e0b", icon: "", fields: [{ key: "api_key", label: "API Key", placeholder: "{{env.NOTION_API_KEY}}" }, { key: "page_id", label: "Page ID", placeholder: "" }, { key: "text", label: "Text", placeholder: "{{n2.text}}", textarea: true }] },
      { type: "action.notion_query_database", label: "Query Database", color: "#f59e0b", icon: "", fields: [{ key: "api_key", label: "API Key", placeholder: "{{env.NOTION_API_KEY}}" }, { key: "database_id", label: "Database ID", placeholder: "" }, { key: "page_size", label: "Page Size", placeholder: "10" }] },
    ],
  },
  {
    category: "Google Sheets",
    nodes: [
      { type: "action.sheets_append_row", label: "Append Row",  color: "#22c55e", icon: "", fields: [{ key: "service_account", label: "Service Account JSON", placeholder: '{"type":"service_account",...}', textarea: true }, { key: "spreadsheet_id", label: "Spreadsheet ID", placeholder: "" }, { key: "sheet_name", label: "Sheet Name", placeholder: "Sheet1" }, { key: "values", label: "Values (comma-separated)", placeholder: "{{n1.title}}, {{n1.view_count}}" }] },
      { type: "action.sheets_read_range", label: "Read Range",  color: "#22c55e", icon: "", fields: [{ key: "service_account", label: "Service Account JSON", placeholder: '{"type":"service_account",...}', textarea: true }, { key: "spreadsheet_id", label: "Spreadsheet ID", placeholder: "" }, { key: "range", label: "Range", placeholder: "Sheet1!A1:D100" }] },
    ],
  },
  {
    category: "Discord",
    nodes: [
      { type: "action.discord_send_message", label: "Send Message", color: "#5865F2", icon: "", fields: [{ key: "webhook_url", label: "Webhook URL", placeholder: "https://discord.com/api/webhooks/..." }, { key: "content", label: "Message", placeholder: "New video: {{n1.title}}", textarea: true }, { key: "username", label: "Bot Name", placeholder: "Weavo" }] },
      { type: "action.discord_send_embed",   label: "Send Embed",   color: "#5865F2", icon: "", fields: [{ key: "webhook_url", label: "Webhook URL", placeholder: "https://discord.com/api/webhooks/..." }, { key: "title", label: "Title", placeholder: "{{n1.title}}" }, { key: "description", label: "Description", placeholder: "{{n1.description}}", textarea: true }, { key: "color", label: "Color (hex)", placeholder: "#5865F2" }, { key: "footer", label: "Footer", placeholder: "Weavo Automation" }, { key: "username", label: "Bot Name", placeholder: "Weavo" }] },
    ],
  },
  {
    category: "Slack",
    nodes: [
      { type: "action.slack_send_message", label: "Send Message", color: "#36C5F0", icon: "", fields: [{ key: "webhook_url", label: "Webhook URL", placeholder: "https://hooks.slack.com/services/..." }, { key: "text", label: "Message", placeholder: "New video: {{n1.title}}", textarea: true }, { key: "username", label: "Bot Name", placeholder: "Weavo" }, { key: "icon_emoji", label: "Emoji Icon", placeholder: ":robot_face:" }] },
      { type: "action.slack_send_blocks",  label: "Send Blocks",  color: "#36C5F0", icon: "", fields: [{ key: "webhook_url", label: "Webhook URL", placeholder: "https://hooks.slack.com/services/..." }, { key: "title", label: "Title (optional)", placeholder: "📢 New Video" }, { key: "text", label: "Text (Markdown)", placeholder: "*{{n1.title}}*\n{{n1.description}}", textarea: true }, { key: "username", label: "Bot Name", placeholder: "Weavo" }] },
    ],
  },
  {
    category: "Email",
    nodes: [
      { type: "action.email_send", label: "Send Email", color: "#f97316", icon: "", fields: [{ key: "to", label: "To", placeholder: "user@example.com" }, { key: "subject", label: "Subject", placeholder: "{{n1.title}}" }, { key: "body", label: "Body (HTML ok)", placeholder: "<b>{{n1.title}}</b><br>{{n1.description}}", textarea: true }, { key: "from_name", label: "From Name", placeholder: "Weavo" }, { key: "api_key", label: "Resend API Key (optional)", placeholder: "re_... (or set RESEND_API_KEY env)" }] },
    ],
  },
  {
    category: "WhatsApp",
    nodes: [
      { type: "action.whatsapp_send_message",  label: "Send Message",  color: "#25D366", icon: "", fields: [{ key: "phone_number_id", label: "Phone Number ID", placeholder: "1234567890" }, { key: "access_token", label: "Access Token", placeholder: "EAAx..." }, { key: "to", label: "Recipient Phone", placeholder: "+14155552671" }, { key: "message", label: "Message", placeholder: "Hello {{n1.title}}", textarea: true }] },
      { type: "action.whatsapp_send_template", label: "Send Template", color: "#25D366", icon: "", fields: [{ key: "phone_number_id", label: "Phone Number ID", placeholder: "1234567890" }, { key: "access_token", label: "Access Token", placeholder: "EAAx..." }, { key: "to", label: "Recipient Phone", placeholder: "+14155552671" }, { key: "template_name", label: "Template Name", placeholder: "hello_world" }, { key: "language_code", label: "Language", placeholder: "en_US" }] },
    ],
  },
  {
    category: "Reddit",
    nodes: [
      { type: "action.reddit_post",    label: "Submit Post",   color: "#FF4500", icon: "", fields: [{ key: "client_id", label: "Client ID", placeholder: "your_client_id" }, { key: "client_secret", label: "Client Secret", placeholder: "your_secret" }, { key: "username", label: "Reddit Username", placeholder: "your_username" }, { key: "password", label: "Password", placeholder: "your_password" }, { key: "subreddit", label: "Subreddit", placeholder: "r/test" }, { key: "title", label: "Title", placeholder: "{{n1.title}}" }, { key: "text", label: "Body", placeholder: "{{n1.description}}", textarea: true }] },
      { type: "action.reddit_comment", label: "Post Comment",  color: "#FF4500", icon: "", fields: [{ key: "client_id", label: "Client ID", placeholder: "your_client_id" }, { key: "client_secret", label: "Client Secret", placeholder: "your_secret" }, { key: "username", label: "Reddit Username", placeholder: "your_username" }, { key: "password", label: "Password", placeholder: "your_password" }, { key: "thing_id", label: "Post ID (t3_xxx)", placeholder: "t3_abc123" }, { key: "text", label: "Comment Text", placeholder: "{{n2.text}}", textarea: true }] },
    ],
  },
  {
    category: "Threads",
    nodes: [
      { type: "action.threads_post",       label: "Post Text",  color: "#000000", icon: "", fields: [{ key: "user_id", label: "User ID", placeholder: "your_threads_user_id" }, { key: "access_token", label: "Access Token", placeholder: "your_access_token" }, { key: "text", label: "Post Text", placeholder: "{{n1.title}}\n\n{{n1.description}}", textarea: true }] },
      { type: "action.threads_post_image", label: "Post Image", color: "#000000", icon: "", fields: [{ key: "user_id", label: "User ID", placeholder: "your_threads_user_id" }, { key: "access_token", label: "Access Token", placeholder: "your_access_token" }, { key: "image_url", label: "Image URL", placeholder: "{{n1.thumbnail_url}}" }, { key: "text", label: "Caption (optional)", placeholder: "{{n1.title}}", textarea: true }] },
    ],
  },
  {
    category: "Logic",
    nodes: [
      { type: "action.log",             label: "Log",          color: "#64748b", icon: "", fields: [{ key: "message", label: "Message", placeholder: "{{n1.title}}", textarea: true }] },
      { type: "action.delay",           label: "Delay",        color: "#64748b", icon: "", fields: [{ key: "seconds", label: "Seconds", placeholder: "5" }] },
      { type: "action.http_request",    label: "HTTP Request", color: "#64748b", icon: "", fields: [{ key: "url", label: "URL", placeholder: "https://..." }, { key: "method", label: "Method", placeholder: "POST" }] },
      { type: "transform.set_variable", label: "Set Variable", color: "#64748b", icon: "", fields: [{ key: "variables", label: "Variables (JSON)", placeholder: '{"key":"{{n1.title}}"}', textarea: true }] },
      { type: "logic.condition",        label: "Condition",    color: "#64748b", icon: "", fields: [{ key: "left", label: "Left", placeholder: "{{n1.view_count}}" }, { key: "operator", label: "Operator", placeholder: "gt" }, { key: "right", label: "Right", placeholder: "1000" }] },
    ],
  },
];

export const NODE_MAP = Object.fromEntries(
  NODE_CATALOG.flatMap(c => c.nodes).map(n => [n.type, n])
);
