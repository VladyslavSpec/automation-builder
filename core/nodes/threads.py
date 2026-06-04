import httpx
import asyncio
from .base import BaseNode, ExecutionContext

THREADS_BASE = "https://graph.threads.net/v1.0"


class ThreadsPostNode(BaseNode):
    """Publish a text post to Threads.
    Config: user_id, access_token, text
    Output: ok, post_id
    """
    node_type = "action.threads_post"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        user_id = cfg["user_id"]
        access_token = cfg["access_token"]
        text = cfg["text"]

        async with httpx.AsyncClient(timeout=30) as client:
            # Step 1: Create media container
            resp = await client.post(
                f"{THREADS_BASE}/{user_id}/threads",
                params={
                    "media_type": "TEXT",
                    "text": text,
                    "access_token": access_token,
                },
            )
            data = resp.json()
            if "error" in data:
                raise ValueError(f"Threads error: {data['error'].get('message', str(data['error']))}")
            container_id = data["id"]

            # Brief wait for container processing
            await asyncio.sleep(2)

            # Step 2: Publish container
            pub_resp = await client.post(
                f"{THREADS_BASE}/{user_id}/threads_publish",
                params={"creation_id": container_id, "access_token": access_token},
            )
            pub_data = pub_resp.json()
            if "error" in pub_data:
                raise ValueError(f"Threads publish error: {pub_data['error'].get('message', str(pub_data['error']))}")

        return {"ok": True, "post_id": pub_data.get("id", container_id)}


class ThreadsPostImageNode(BaseNode):
    """Publish an image post to Threads.
    Config: user_id, access_token, image_url, text (optional)
    Output: ok, post_id
    """
    node_type = "action.threads_post_image"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        user_id = cfg["user_id"]
        access_token = cfg["access_token"]
        image_url = cfg["image_url"]
        text = cfg.get("text", "")

        async with httpx.AsyncClient(timeout=30) as client:
            params = {
                "media_type": "IMAGE",
                "image_url": image_url,
                "access_token": access_token,
            }
            if text:
                params["text"] = text

            resp = await client.post(f"{THREADS_BASE}/{user_id}/threads", params=params)
            data = resp.json()
            if "error" in data:
                raise ValueError(f"Threads error: {data['error'].get('message', str(data['error']))}")
            container_id = data["id"]

            await asyncio.sleep(3)

            pub_resp = await client.post(
                f"{THREADS_BASE}/{user_id}/threads_publish",
                params={"creation_id": container_id, "access_token": access_token},
            )
            pub_data = pub_resp.json()
            if "error" in pub_data:
                raise ValueError(f"Threads publish error: {pub_data['error'].get('message', str(pub_data['error']))}")

        return {"ok": True, "post_id": pub_data.get("id", container_id)}
