import httpx
from .base import BaseNode, ExecutionContext


class SlackSendMessageNode(BaseNode):
    """Send a message to a Slack channel via Incoming Webhook.
    Config: webhook_url, text, username (optional), icon_emoji (optional)
    Output: ok
    """
    node_type = "action.slack_send_message"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        webhook_url = cfg["webhook_url"]
        text = cfg["text"]
        username = cfg.get("username", "Weavo")
        icon_emoji = cfg.get("icon_emoji", ":robot_face:")

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(webhook_url, json={
                "text": text,
                "username": username,
                "icon_emoji": icon_emoji,
            })
            if resp.status_code != 200 or resp.text.strip() != "ok":
                raise ValueError(f"Slack error: {resp.status_code} {resp.text}")

        return {"ok": True}


class SlackSendBlocksNode(BaseNode):
    """Send a rich blocks message to Slack via Incoming Webhook.
    Config: webhook_url, title (optional), text, username (optional)
    Output: ok
    """
    node_type = "action.slack_send_blocks"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        webhook_url = cfg["webhook_url"]
        title = cfg.get("title", "")
        text = cfg["text"]
        username = cfg.get("username", "Weavo")

        blocks = []
        if title:
            blocks.append({"type": "header", "text": {"type": "plain_text", "text": title}})
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": text}})

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(webhook_url, json={
                "username": username,
                "icon_emoji": ":robot_face:",
                "blocks": blocks,
            })
            if resp.status_code != 200 or resp.text.strip() != "ok":
                raise ValueError(f"Slack error: {resp.status_code} {resp.text}")

        return {"ok": True}
