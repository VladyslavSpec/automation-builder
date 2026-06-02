import hmac
import hashlib
import base64
import time
import random
import string
import httpx
from urllib.parse import quote
from .base import BaseNode, ExecutionContext


def _oauth1_header(method: str, url: str, body_params: dict,
                   consumer_key: str, consumer_secret: str,
                   token: str, token_secret: str) -> str:
    oauth_params = {
        "oauth_consumer_key": consumer_key,
        "oauth_nonce": "".join(random.choices(string.ascii_letters + string.digits, k=32)),
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": str(int(time.time())),
        "oauth_token": token,
        "oauth_version": "1.0",
    }

    all_params = {**body_params, **oauth_params}
    param_string = "&".join(
        f"{quote(str(k), safe='')}={quote(str(v), safe='')}"
        for k, v in sorted(all_params.items())
    )

    base_string = "&".join([
        method.upper(),
        quote(url, safe=""),
        quote(param_string, safe=""),
    ])

    signing_key = f"{quote(consumer_secret, safe='')}&{quote(token_secret, safe='')}"
    signature = base64.b64encode(
        hmac.new(signing_key.encode(), base_string.encode(), hashlib.sha1).digest()
    ).decode()

    oauth_params["oauth_signature"] = signature

    return "OAuth " + ", ".join(
        f'{quote(k, safe="")}="{quote(str(v), safe="")}"'
        for k, v in sorted(oauth_params.items())
    )


class TwitterPostTweetNode(BaseNode):
    """Post a tweet via Twitter API v2 (OAuth 1.0a).
    Config: consumer_key, consumer_secret, access_token, access_token_secret, text
    Output: tweet_id, text, url
    """
    node_type = "action.twitter_post_tweet"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        consumer_key = cfg["consumer_key"]
        consumer_secret = cfg["consumer_secret"]
        access_token = cfg["access_token"]
        access_token_secret = cfg["access_token_secret"]
        text = cfg["text"]

        url = "https://api.twitter.com/2/tweets"
        auth_header = _oauth1_header(
            "POST", url, {},
            consumer_key, consumer_secret,
            access_token, access_token_secret,
        )

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                url,
                headers={
                    "Authorization": auth_header,
                    "Content-Type": "application/json",
                },
                json={"text": text},
            )
            data = resp.json()

        if "errors" in data or "detail" in data:
            raise ValueError(f"Twitter error: {data.get('detail') or data.get('errors')}")

        tweet = data.get("data", {})
        tweet_id = tweet.get("id", "")

        return {
            "tweet_id": tweet_id,
            "text": tweet.get("text", text),
            "url": f"https://twitter.com/i/web/status/{tweet_id}",
        }


class TwitterPostThreadNode(BaseNode):
    """Post a thread (multiple tweets) via Twitter API v2.
    Config: consumer_key, consumer_secret, access_token, access_token_secret,
            tweets (list of strings, max 280 chars each)
    Output: tweet_ids (list), first_tweet_url
    """
    node_type = "action.twitter_post_thread"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)
        consumer_key = cfg["consumer_key"]
        consumer_secret = cfg["consumer_secret"]
        access_token = cfg["access_token"]
        access_token_secret = cfg["access_token_secret"]
        tweets = cfg["tweets"]

        if isinstance(tweets, str):
            tweets = [t.strip() for t in tweets.split("|||") if t.strip()]

        url = "https://api.twitter.com/2/tweets"
        tweet_ids = []
        reply_to = None

        async with httpx.AsyncClient(timeout=15) as client:
            for text in tweets:
                auth_header = _oauth1_header(
                    "POST", url, {},
                    consumer_key, consumer_secret,
                    access_token, access_token_secret,
                )
                body = {"text": text}
                if reply_to:
                    body["reply"] = {"in_reply_to_tweet_id": reply_to}

                resp = await client.post(
                    url,
                    headers={"Authorization": auth_header, "Content-Type": "application/json"},
                    json=body,
                )
                data = resp.json()
                if "errors" in data or "detail" in data:
                    raise ValueError(f"Twitter error: {data.get('detail') or data.get('errors')}")

                tweet_id = data["data"]["id"]
                tweet_ids.append(tweet_id)
                reply_to = tweet_id

        return {
            "tweet_ids": tweet_ids,
            "count": len(tweet_ids),
            "first_tweet_url": f"https://twitter.com/i/web/status/{tweet_ids[0]}" if tweet_ids else "",
        }
