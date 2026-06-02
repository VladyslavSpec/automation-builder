import httpx
from .base import BaseNode, ExecutionContext


class YouTubeGetVideoNode(BaseNode):
    """Get full video details by video ID.
    Config: video_id, api_key
    Output: title, description, tags, view_count, like_count, comment_count,
            published_at, channel_title, thumbnail_url, video_id
    """
    node_type = "action.youtube_get_video"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        video_id = cfg["video_id"]
        api_key = cfg["api_key"]

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://www.googleapis.com/youtube/v3/videos",
                params={"id": video_id, "part": "snippet,statistics", "key": api_key},
            )
            resp.raise_for_status()
            data = resp.json()

        items = data.get("items", [])
        if not items:
            raise ValueError(f"Video not found: {video_id}")

        snippet = items[0]["snippet"]
        stats = items[0].get("statistics", {})

        return {
            "video_id": video_id,
            "title": snippet["title"],
            "description": snippet["description"],
            "tags": snippet.get("tags", []),
            "channel_title": snippet["channelTitle"],
            "published_at": snippet["publishedAt"],
            "thumbnail_url": snippet["thumbnails"]["high"]["url"],
            "view_count": int(stats.get("viewCount", 0)),
            "like_count": int(stats.get("likeCount", 0)),
            "comment_count": int(stats.get("commentCount", 0)),
        }


class YouTubeLatestVideoNode(BaseNode):
    """Get the latest N videos from a channel.
    Config: channel_id, api_key, max_results (default 1)
    Output: videos (list), latest_video_id, latest_video_title, count
    """
    node_type = "action.youtube_latest_video"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        channel_id = cfg["channel_id"]
        api_key = cfg["api_key"]
        max_results = int(cfg.get("max_results", 1))

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "channelId": channel_id,
                    "part": "snippet",
                    "order": "date",
                    "maxResults": max_results,
                    "type": "video",
                    "key": api_key,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        items = data.get("items", [])
        videos = [
            {
                "video_id": item["id"]["videoId"],
                "title": item["snippet"]["title"],
                "description": item["snippet"]["description"],
                "published_at": item["snippet"]["publishedAt"],
                "thumbnail_url": item["snippet"]["thumbnails"]["high"]["url"],
            }
            for item in items
        ]

        return {
            "videos": videos,
            "latest_video_id": videos[0]["video_id"] if videos else None,
            "latest_video_title": videos[0]["title"] if videos else None,
            "count": len(videos),
        }


class YouTubeChannelStatsNode(BaseNode):
    """Get channel statistics.
    Config: channel_id, api_key
    Output: channel_title, subscriber_count, video_count, view_count
    """
    node_type = "action.youtube_channel_stats"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        channel_id = cfg["channel_id"]
        api_key = cfg["api_key"]

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://www.googleapis.com/youtube/v3/channels",
                params={
                    "id": channel_id,
                    "part": "snippet,statistics",
                    "key": api_key,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        items = data.get("items", [])
        if not items:
            raise ValueError(f"Channel not found: {channel_id}")

        snippet = items[0]["snippet"]
        stats = items[0].get("statistics", {})

        return {
            "channel_id": channel_id,
            "channel_title": snippet["title"],
            "description": snippet["description"],
            "subscriber_count": int(stats.get("subscriberCount", 0)),
            "video_count": int(stats.get("videoCount", 0)),
            "view_count": int(stats.get("viewCount", 0)),
        }
