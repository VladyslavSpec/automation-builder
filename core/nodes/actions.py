import asyncio
import httpx
from .base import BaseNode, ExecutionContext


class HttpRequestNode(BaseNode):
    """Makes an HTTP request. Config: url, method, headers, body."""
    node_type = "action.http_request"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        method = cfg.get("method", "GET").upper()
        url = cfg["url"]
        headers = cfg.get("headers", {})
        body = cfg.get("body", None)

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.request(method, url, headers=headers, json=body)

        return {
            "status_code": response.status_code,
            "body": response.text,
            "ok": response.is_success,
        }


class DelayNode(BaseNode):
    """Waits N seconds. Config: seconds."""
    node_type = "action.delay"

    async def execute(self, context: ExecutionContext) -> dict:
        seconds = float(context.resolve(self.config.get("seconds", 1)))
        await asyncio.sleep(seconds)
        return {"waited_seconds": seconds}


class SetVariableNode(BaseNode):
    """Sets variables in context. Config: {key: value, ...}"""
    node_type = "transform.set_variable"

    async def execute(self, context: ExecutionContext) -> dict:
        resolved = context.resolve_dict(self.config.get("variables", {}))
        context.variables.update(resolved)
        return resolved


class ConditionNode(BaseNode):
    """If/else branching. Config: left, operator, right, true_path, false_path."""
    node_type = "logic.condition"

    async def execute(self, context: ExecutionContext) -> dict:
        left = context.resolve(self.config.get("left", ""))
        right = context.resolve(self.config.get("right", ""))
        operator = self.config.get("operator", "eq")

        result = False
        if operator == "eq":
            result = left == right
        elif operator == "neq":
            result = left != right
        elif operator == "contains":
            result = right in left
        elif operator == "gt":
            result = float(left) > float(right)
        elif operator == "lt":
            result = float(left) < float(right)

        return {"result": result, "branch": "true" if result else "false"}


class LogNode(BaseNode):
    """Logs a message (useful for debugging). Config: message."""
    node_type = "action.log"

    async def execute(self, context: ExecutionContext) -> dict:
        message = context.resolve(self.config.get("message", ""))
        print(f"[LOG node={self.node_id}] {message}")
        return {"logged": message}
