import httpx
from .base import BaseNode, ExecutionContext


class DiscordSendMessageNode(BaseNode):
    """Send a text message to a Discord channel via webhook.
    Config: webhook_url, content, username (optional)
    Output: ok
    """
    node_type = "action.discord_send_message"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        webhook_url = cfg["webhook_url"]
        content = cfg["content"]
        username = cfg.get("username", "Weavo")

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(webhook_url, json={"content": content, "username": username})
            if resp.status_code not in (200, 204):
                raise ValueError(f"Discord error: {resp.status_code} {resp.text}")

        return {"ok": True}


class DiscordSendEmbedNode(BaseNode):
    """Send a rich embed to a Discord channel via webhook.
    Config: webhook_url, title, description, color (hex, default #5865F2), footer (optional), username (optional)
    Output: ok
    """
    node_type = "action.discord_send_embed"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        webhook_url = cfg["webhook_url"]
        title = cfg.get("title", "")
        description = cfg.get("description", "")
        color_hex = cfg.get("color", "#5865F2").lstrip("#")
        footer = cfg.get("footer", "")
        username = cfg.get("username", "Weavo")

        try:
            color_int = int(color_hex, 16)
        except ValueError:
            color_int = 0x5865F2

        embed = {"title": title, "description": description, "color": color_int}
        if footer:
            embed["footer"] = {"text": footer}

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(webhook_url, json={"username": username, "embeds": [embed]})
            if resp.status_code not in (200, 204):
                raise ValueError(f"Discord error: {resp.status_code} {resp.text}")

        return {"ok": True}
