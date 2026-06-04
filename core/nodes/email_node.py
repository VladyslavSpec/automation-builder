import os
import httpx
from .base import BaseNode, ExecutionContext


class EmailSendNode(BaseNode):
    """Send an email via Resend API.
    Config: to, subject, body (HTML supported), from_name (optional), api_key (optional, falls back to RESEND_API_KEY env)
    Output: ok, email_id
    """
    node_type = "action.email_send"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        to = cfg["to"]
        subject = cfg["subject"]
        body = cfg["body"]
        from_name = cfg.get("from_name", "Weavo")
        api_key = cfg.get("api_key", "") or os.getenv("RESEND_API_KEY", "")

        if not api_key:
            raise ValueError("Resend API key not configured. Add RESEND_API_KEY to env or node config.")

        html_body = body if "<" in body else body.replace("\n", "<br>")

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": f"{from_name} <noreply@weavo.run>",
                    "to": [to],
                    "subject": subject,
                    "html": html_body,
                },
            )
            data = resp.json()

        if resp.status_code not in (200, 201):
            raise ValueError(f"Email error: {data.get('message', resp.text)}")

        return {"ok": True, "email_id": data.get("id", "")}
