from .base import BaseNode, ExecutionContext


class WebhookTriggerNode(BaseNode):
    """Triggered by an incoming HTTP POST. Config: token (auto-generated)."""
    node_type = "trigger.webhook"

    async def execute(self, context: ExecutionContext) -> dict:
        return context.trigger_data


class ScheduleTriggerNode(BaseNode):
    """Triggered on a cron schedule. Config: cron (e.g. '0 9 * * *')."""
    node_type = "trigger.schedule"

    async def execute(self, context: ExecutionContext) -> dict:
        return context.trigger_data
