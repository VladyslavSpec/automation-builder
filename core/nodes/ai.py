import httpx
from .base import BaseNode, ExecutionContext


class ClaudeGenerateNode(BaseNode):
    """Generate text using Anthropic Claude.
    Config: api_key, prompt, model (default haiku), max_tokens (default 1024)
    Output: text, model, input_tokens, output_tokens
    """
    node_type = "action.claude_generate"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        api_key = cfg["api_key"]
        prompt = cfg["prompt"]
        model = cfg.get("model", "claude-haiku-4-5-20251001")
        max_tokens = int(cfg.get("max_tokens", 1024))

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": model,
                    "max_tokens": max_tokens,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            resp.raise_for_status()
            data = resp.json()

        text = data["content"][0]["text"]
        usage = data.get("usage", {})

        return {
            "text": text,
            "model": data.get("model", model),
            "input_tokens": usage.get("input_tokens", 0),
            "output_tokens": usage.get("output_tokens", 0),
        }


class OpenAIGenerateNode(BaseNode):
    """Generate text using OpenAI GPT.
    Config: api_key, prompt, model (default gpt-4o-mini), max_tokens (default 1024)
    Output: text, model, total_tokens
    """
    node_type = "action.openai_generate"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        api_key = cfg["api_key"]
        prompt = cfg["prompt"]
        model = cfg.get("model", "gpt-4o-mini")
        max_tokens = int(cfg.get("max_tokens", 1024))

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "max_tokens": max_tokens,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            resp.raise_for_status()
            data = resp.json()

        text = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})

        return {
            "text": text,
            "model": data.get("model", model),
            "total_tokens": usage.get("total_tokens", 0),
        }
