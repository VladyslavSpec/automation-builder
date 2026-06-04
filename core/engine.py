from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from models import WorkflowExecution, NodeExecution, ExecutionStatus
from .nodes.base import BaseNode, ExecutionContext
from .nodes.triggers import WebhookTriggerNode, ScheduleTriggerNode
from .nodes.actions import HttpRequestNode, DelayNode, SetVariableNode, ConditionNode, LogNode
from .nodes.youtube import YouTubeGetVideoNode, YouTubeLatestVideoNode, YouTubeChannelStatsNode
from .nodes.telegram import TelegramSendMessageNode, TelegramSendPhotoNode, TelegramSendDocumentNode
from .nodes.ai import ClaudeGenerateNode, OpenAIGenerateNode
from .nodes.twitter import TwitterPostTweetNode, TwitterPostThreadNode
from .nodes.notion import NotionCreatePageNode, NotionAppendBlockNode, NotionQueryDatabaseNode
from .nodes.sheets import SheetsAppendRowNode, SheetsReadRangeNode
from .nodes.discord import DiscordSendMessageNode, DiscordSendEmbedNode
from .nodes.slack import SlackSendMessageNode, SlackSendBlocksNode
from .nodes.email_node import EmailSendNode

NODE_REGISTRY: dict[str, type[BaseNode]] = {
    # Triggers
    "trigger.webhook": WebhookTriggerNode,
    "trigger.schedule": ScheduleTriggerNode,
    # Core actions
    "action.http_request": HttpRequestNode,
    "action.delay": DelayNode,
    "action.log": LogNode,
    # Transform / Logic
    "transform.set_variable": SetVariableNode,
    "logic.condition": ConditionNode,
    # YouTube
    "action.youtube_get_video": YouTubeGetVideoNode,
    "action.youtube_latest_video": YouTubeLatestVideoNode,
    "action.youtube_channel_stats": YouTubeChannelStatsNode,
    # Telegram
    "action.telegram_send_message": TelegramSendMessageNode,
    "action.telegram_send_photo": TelegramSendPhotoNode,
    "action.telegram_send_document": TelegramSendDocumentNode,
    # AI
    "action.claude_generate": ClaudeGenerateNode,
    "action.openai_generate": OpenAIGenerateNode,
    # Twitter / X
    "action.twitter_post_tweet": TwitterPostTweetNode,
    "action.twitter_post_thread": TwitterPostThreadNode,
    # Notion
    "action.notion_create_page": NotionCreatePageNode,
    "action.notion_append_block": NotionAppendBlockNode,
    "action.notion_query_database": NotionQueryDatabaseNode,
    # Google Sheets
    "action.sheets_append_row": SheetsAppendRowNode,
    "action.sheets_read_range": SheetsReadRangeNode,
    # Discord
    "action.discord_send_message": DiscordSendMessageNode,
    "action.discord_send_embed": DiscordSendEmbedNode,
    # Slack
    "action.slack_send_message": SlackSendMessageNode,
    "action.slack_send_blocks": SlackSendBlocksNode,
    # Email
    "action.email_send": EmailSendNode,
}


def _topological_sort(nodes: list[dict], connections: list[dict]) -> list[str]:
    """Returns node IDs in execution order (trigger first, then dependents)."""
    in_degree = {n["id"]: 0 for n in nodes}
    children: dict[str, list[str]] = {n["id"]: [] for n in nodes}

    for conn in connections:
        children[conn["from"]].append(conn["to"])
        in_degree[conn["to"]] += 1

    queue = [nid for nid, deg in in_degree.items() if deg == 0]
    order = []

    while queue:
        nid = queue.pop(0)
        order.append(nid)
        for child in children[nid]:
            in_degree[child] -= 1
            if in_degree[child] == 0:
                queue.append(child)

    return order


class WorkflowEngine:
    def __init__(self, db: Session):
        self.db = db

    async def run(self, execution_id: str, workflow_definition: dict, trigger_data: dict):
        execution = self.db.query(WorkflowExecution).filter_by(id=execution_id).first()
        execution.status = ExecutionStatus.running
        execution.started_at = datetime.now(timezone.utc)
        self.db.commit()

        context = ExecutionContext(trigger_data=trigger_data)
        nodes_map = {n["id"]: n for n in workflow_definition["nodes"]}
        connections = workflow_definition.get("connections", [])
        order = _topological_sort(workflow_definition["nodes"], connections)

        try:
            for node_id in order:
                node_def = nodes_map[node_id]
                await self._run_node(node_def, context, execution_id)

            execution.status = ExecutionStatus.success
        except Exception as e:
            execution.status = ExecutionStatus.failed
            execution.error = str(e)
        finally:
            execution.finished_at = datetime.now(timezone.utc)
            self.db.commit()

    async def _run_node(self, node_def: dict, context: ExecutionContext, execution_id: str):
        node_id = node_def["id"]
        node_type = node_def["type"]
        config = node_def.get("config", {})

        node_exec = NodeExecution(
            execution_id=execution_id,
            node_id=node_id,
            node_type=node_type,
            status=ExecutionStatus.running,
            input_data=dict(context.trigger_data),
            started_at=datetime.now(timezone.utc),
        )
        self.db.add(node_exec)
        self.db.commit()

        try:
            NodeClass = NODE_REGISTRY.get(node_type)
            if not NodeClass:
                raise ValueError(f"Unknown node type: {node_type}")

            node = NodeClass(node_id=node_id, config=config)
            output = await node.execute(context)

            context.node_outputs[node_id] = output

            node_exec.status = ExecutionStatus.success
            node_exec.output_data = output
        except Exception as e:
            node_exec.status = ExecutionStatus.failed
            node_exec.error = str(e)
            self.db.commit()
            raise
        finally:
            node_exec.finished_at = datetime.now(timezone.utc)
            self.db.commit()
