import httpx
from .base import BaseNode, ExecutionContext


async def _get_reddit_token(client_id: str, client_secret: str, username: str, password: str) -> str:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            "https://www.reddit.com/api/v1/access_token",
            auth=(client_id, client_secret),
            data={"grant_type": "password", "username": username, "password": password},
            headers={"User-Agent": "Weavo-Automation/1.0"},
        )
        data = resp.json()
    if "access_token" not in data:
        raise ValueError(f"Reddit auth error: {data.get('error', str(data))}")
    return data["access_token"]


class RedditPostNode(BaseNode):
    """Submit a text post to a subreddit.
    Config: client_id, client_secret, username, password, subreddit, title, text
    Output: ok, post_id, post_url
    """
    node_type = "action.reddit_post"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        token = await _get_reddit_token(
            cfg["client_id"], cfg["client_secret"], cfg["username"], cfg["password"]
        )

        subreddit = cfg["subreddit"].lstrip("r/")
        title = cfg["title"]
        text = cfg.get("text", "")

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://oauth.reddit.com/api/submit",
                headers={
                    "Authorization": f"Bearer {token}",
                    "User-Agent": "Weavo-Automation/1.0",
                },
                data={
                    "kind": "self",
                    "sr": subreddit,
                    "title": title,
                    "text": text,
                    "resubmit": "true",
                },
            )
            data = resp.json()

        jquery = data.get("jquery", [])
        errors = [item for item in jquery if isinstance(item, list) and len(item) > 3 and item[3] and "error" in str(item).lower()]
        if errors:
            raise ValueError(f"Reddit post error: {errors}")

        post_url = ""
        for item in jquery:
            if isinstance(item, list) and len(item) > 3 and isinstance(item[3], str) and "reddit.com/r/" in item[3]:
                post_url = item[3]
                break

        post_id = post_url.split("/comments/")[1].split("/")[0] if "/comments/" in post_url else ""
        return {"ok": True, "post_id": post_id, "post_url": post_url}


class RedditCommentNode(BaseNode):
    """Post a comment on a Reddit thread.
    Config: client_id, client_secret, username, password, thing_id (t3_xxx), text
    Output: ok, comment_id
    """
    node_type = "action.reddit_comment"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        token = await _get_reddit_token(
            cfg["client_id"], cfg["client_secret"], cfg["username"], cfg["password"]
        )

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://oauth.reddit.com/api/comment",
                headers={
                    "Authorization": f"Bearer {token}",
                    "User-Agent": "Weavo-Automation/1.0",
                },
                data={"thing_id": cfg["thing_id"], "text": cfg["text"]},
            )
            data = resp.json()

        comment_id = ""
        for item in data.get("jquery", []):
            if isinstance(item, list) and len(item) > 3 and isinstance(item[3], dict):
                comment_id = item[3].get("id", "")
                if comment_id:
                    break

        return {"ok": True, "comment_id": comment_id}
