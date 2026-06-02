import httpx
from .base import BaseNode, ExecutionContext


def _notion_headers(api_key: str) -> dict:
    return {
        "Authorization": f"Bearer {api_key}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
    }


class NotionCreatePageNode(BaseNode):
    """Create a new page in a Notion database.
    Config: api_key, database_id, title, content (optional text body), extra_props (dict, optional)
    Output: page_id, url, title
    """
    node_type = "action.notion_create_page"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        api_key = cfg["api_key"]
        database_id = cfg["database_id"]
        title = cfg.get("title", "Untitled")
        content = cfg.get("content", "")
        extra_props = cfg.get("extra_props", {})

        properties = {
            "title": {
                "title": [{"text": {"content": title}}]
            },
            **extra_props,
        }

        children = []
        if content:
            children.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": content[:2000]}}]
                },
            })

        body = {
            "parent": {"database_id": database_id},
            "properties": properties,
        }
        if children:
            body["children"] = children

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.notion.com/v1/pages",
                headers=_notion_headers(api_key),
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()

        return {
            "page_id": data["id"],
            "url": data.get("url", ""),
            "title": title,
        }


class NotionAppendBlockNode(BaseNode):
    """Append a text paragraph to an existing Notion page.
    Config: api_key, page_id, text
    Output: block_id, page_id
    """
    node_type = "action.notion_append_block"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        api_key = cfg["api_key"]
        page_id = cfg["page_id"]
        text = cfg["text"]

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.patch(
                f"https://api.notion.com/v1/blocks/{page_id}/children",
                headers=_notion_headers(api_key),
                json={
                    "children": [{
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [{"type": "text", "text": {"content": text[:2000]}}]
                        },
                    }]
                },
            )
            resp.raise_for_status()
            data = resp.json()

        block_id = data["results"][0]["id"] if data.get("results") else ""

        return {
            "block_id": block_id,
            "page_id": page_id,
        }


class NotionQueryDatabaseNode(BaseNode):
    """Query pages from a Notion database.
    Config: api_key, database_id, page_size (default 10)
    Output: pages (list of {id, title, url}), count
    """
    node_type = "action.notion_query_database"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        api_key = cfg["api_key"]
        database_id = cfg["database_id"]
        page_size = int(cfg.get("page_size", 10))

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"https://api.notion.com/v1/databases/{database_id}/query",
                headers=_notion_headers(api_key),
                json={"page_size": page_size},
            )
            resp.raise_for_status()
            data = resp.json()

        pages = []
        for item in data.get("results", []):
            props = item.get("properties", {})
            title = ""
            for prop in props.values():
                if prop.get("type") == "title":
                    parts = prop.get("title", [])
                    title = "".join(p.get("plain_text", "") for p in parts)
                    break
            pages.append({"id": item["id"], "title": title, "url": item.get("url", "")})

        return {"pages": pages, "count": len(pages)}
