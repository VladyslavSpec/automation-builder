import httpx
from .base import BaseNode, ExecutionContext


class WhatsAppSendMessageNode(BaseNode):
    """Send a WhatsApp message via Meta Cloud API.
    Config: phone_number_id, access_token, to (recipient phone with country code), message
    Output: ok, message_id
    """
    node_type = "action.whatsapp_send_message"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        phone_number_id = cfg["phone_number_id"]
        access_token = cfg["access_token"]
        to = cfg["to"].replace("+", "").replace(" ", "")
        message = cfg["message"]

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"https://graph.facebook.com/v18.0/{phone_number_id}/messages",
                headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
                json={
                    "messaging_product": "whatsapp",
                    "to": to,
                    "type": "text",
                    "text": {"body": message},
                },
            )
            data = resp.json()

        if "error" in data:
            raise ValueError(f"WhatsApp error: {data['error'].get('message', str(data['error']))}")

        msg_id = data.get("messages", [{}])[0].get("id", "")
        return {"ok": True, "message_id": msg_id}


class WhatsAppSendTemplateNode(BaseNode):
    """Send a WhatsApp template message via Meta Cloud API.
    Config: phone_number_id, access_token, to, template_name, language_code (default en_US)
    Output: ok, message_id
    """
    node_type = "action.whatsapp_send_template"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        phone_number_id = cfg["phone_number_id"]
        access_token = cfg["access_token"]
        to = cfg["to"].replace("+", "").replace(" ", "")
        template_name = cfg["template_name"]
        language_code = cfg.get("language_code", "en_US")

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"https://graph.facebook.com/v18.0/{phone_number_id}/messages",
                headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
                json={
                    "messaging_product": "whatsapp",
                    "to": to,
                    "type": "template",
                    "template": {"name": template_name, "language": {"code": language_code}},
                },
            )
            data = resp.json()

        if "error" in data:
            raise ValueError(f"WhatsApp error: {data['error'].get('message', str(data['error']))}")

        msg_id = data.get("messages", [{}])[0].get("id", "")
        return {"ok": True, "message_id": msg_id}
