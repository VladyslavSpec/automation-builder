from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
import os
import httpx

from api.auth import get_current_user
from database import get_db
from models import User

router = APIRouter(prefix="/chat", tags=["chat"])

FREE_DAILY_LIMIT = 10


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    workflow_context: Optional[str] = None


SYSTEM_PROMPT = """You are an AI assistant embedded in Weavo — a visual no-code workflow automation builder.

Weavo lets users connect services into automated workflows using drag-and-drop nodes. Your job is to help users build, configure, and debug their workflows.

Available node types:
- youtube.trigger — fires when a new video is published on a channel
- claude.generate — generate text/analysis using Claude AI
- openai.generate — generate text using OpenAI
- telegram.send — send a message to a Telegram chat/channel
- discord.webhook — post a message to a Discord channel
- sheets.append — append a row to a Google Sheet
- notion.create — create a page in Notion
- twitter.tweet — post a tweet
- filter.condition — branch logic based on a condition
- delay.wait — pause execution N seconds
- webhook.trigger — start workflow from an HTTP POST webhook
- http.request — make an HTTP request to any URL
- transform.data — reformat/map data using templates

Template syntax: {{trigger.field}} for trigger data, {{nodeId.field}} for outputs of other nodes.

Rules:
- Keep answers concise and practical
- When suggesting a workflow, list the nodes and connections step by step
- If the user shares their current workflow, analyze it specifically
- When configuring nodes, explain what each field does
- Suggest improvements if you see a better approach"""


async def _call_anthropic(api_key: str, messages: list, system: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 1024,
                "system": system,
                "messages": messages,
            },
        )
    if resp.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid Anthropic API key")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="AI service error")
    return resp.json()["content"][0]["text"]


@router.post("/")
async def chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    system = SYSTEM_PROMPT
    if body.workflow_context:
        system += f"\n\nUser's current workflow:\n{body.workflow_context}"

    messages = [{"role": m.role, "content": m.content} for m in body.messages]

    # ── 1. User has their own Anthropic key → use it, no limit ────────────────
    user_key = (current_user.api_keys or {}).get("ANTHROPIC_API_KEY", "").strip()
    if user_key:
        content = await _call_anthropic(user_key, messages, system)
        return {"content": content, "used_own_key": True}

    # ── 2. No own key → use server key with daily limit ───────────────────────
    server_key = os.getenv("ANTHROPIC_API_KEY")
    if not server_key:
        raise HTTPException(
            status_code=503,
            detail="AI assistant not configured. Add your own Anthropic API key in Settings.",
        )

    today = date.today()
    reset_needed = (current_user.chat_free_reset is None or current_user.chat_free_reset < today)

    if reset_needed:
        current_user.chat_free_used = 0
        current_user.chat_free_reset = today
        db.commit()

    used = current_user.chat_free_used or 0

    if used >= FREE_DAILY_LIMIT:
        raise HTTPException(
            status_code=429,
            detail={
                "reason": "daily_limit",
                "used": used,
                "limit": FREE_DAILY_LIMIT,
                "message": f"Free limit reached ({FREE_DAILY_LIMIT} messages/day). Add your own Anthropic API key in Settings → Integrations for unlimited access.",
            },
        )

    content = await _call_anthropic(server_key, messages, system)

    current_user.chat_free_used = used + 1
    db.commit()

    return {
        "content": content,
        "used_own_key": False,
        "messages_used": used + 1,
        "messages_limit": FREE_DAILY_LIMIT,
    }
