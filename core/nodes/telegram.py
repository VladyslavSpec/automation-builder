import httpx
from .base import BaseNode, ExecutionContext


class TelegramSendMessageNode(BaseNode):
    """Send a text message via Telegram bot.
    Config: bot_token, chat_id, text, parse_mode (HTML/Markdown, default HTML)
    Output: ok, message_id, chat_id
    """
    node_type = "action.telegram_send_message"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        bot_token = cfg["bot_token"]
        chat_id = cfg["chat_id"]
        text = cfg["text"]
        parse_mode = cfg.get("parse_mode", "HTML")

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"https://api.telegram.org/bot{bot_token}/sendMessage",
                json={"chat_id": chat_id, "text": text, "parse_mode": parse_mode},
            )
            data = resp.json()

        if not data.get("ok"):
            raise ValueError(f"Telegram error: {data.get('description', 'Unknown error')}")

        return {
            "ok": True,
            "message_id": data["result"]["message_id"],
            "chat_id": chat_id,
        }


class TelegramSendPhotoNode(BaseNode):
    """Send a photo via Telegram bot.
    Config: bot_token, chat_id, photo_url, caption (optional)
    Output: ok, message_id, chat_id
    """
    node_type = "action.telegram_send_photo"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        bot_token = cfg["bot_token"]
        chat_id = cfg["chat_id"]
        photo_url = cfg["photo_url"]
        caption = cfg.get("caption", "")

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"https://api.telegram.org/bot{bot_token}/sendPhoto",
                json={
                    "chat_id": chat_id,
                    "photo": photo_url,
                    "caption": caption,
                    "parse_mode": "HTML",
                },
            )
            data = resp.json()

        if not data.get("ok"):
            raise ValueError(f"Telegram error: {data.get('description', 'Unknown error')}")

        return {
            "ok": True,
            "message_id": data["result"]["message_id"],
            "chat_id": chat_id,
        }


class TelegramSendDocumentNode(BaseNode):
    """Send a document/file via Telegram bot.
    Config: bot_token, chat_id, document_url, caption (optional)
    Output: ok, message_id, chat_id
    """
    node_type = "action.telegram_send_document"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        bot_token = cfg["bot_token"]
        chat_id = cfg["chat_id"]
        document_url = cfg["document_url"]
        caption = cfg.get("caption", "")

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"https://api.telegram.org/bot{bot_token}/sendDocument",
                json={
                    "chat_id": chat_id,
                    "document": document_url,
                    "caption": caption,
                    "parse_mode": "HTML",
                },
            )
            data = resp.json()

        if not data.get("ok"):
            raise ValueError(f"Telegram error: {data.get('description', 'Unknown error')}")

        return {
            "ok": True,
            "message_id": data["result"]["message_id"],
            "chat_id": chat_id,
        }
