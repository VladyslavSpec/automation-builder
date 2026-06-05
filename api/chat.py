from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import httpx

from api.auth import get_current_user
from models import User

router = APIRouter(prefix="/chat", tags=["chat"])


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


@router.post("/")
async def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI assistant not configured")

    system = SYSTEM_PROMPT
    if body.workflow_context:
        system += f"\n\nUser's current workflow:\n{body.workflow_context}"

    messages = [{"role": m.role, "content": m.content} for m in body.messages]

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

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="AI service error")

    data = resp.json()
    return {"content": data["content"][0]["text"]}
