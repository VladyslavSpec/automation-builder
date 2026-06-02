import json
import time
import base64
import httpx
from .base import BaseNode, ExecutionContext

# Google Sheets integration via Service Account JWT auth


def _make_jwt(service_account_json: dict) -> str:
    """Create a JWT for Google API authentication from service account credentials."""
    import hmac, hashlib

    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "RS256", "typ": "JWT"}).encode()
    ).rstrip(b"=").decode()

    now = int(time.time())
    payload = base64.urlsafe_b64encode(json.dumps({
        "iss": service_account_json["client_email"],
        "scope": "https://www.googleapis.com/auth/spreadsheets",
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now,
        "exp": now + 3600,
    }).encode()).rstrip(b"=").decode()

    from cryptography.hazmat.primitives import serialization, hashes
    from cryptography.hazmat.primitives.asymmetric import padding

    private_key = serialization.load_pem_private_key(
        service_account_json["private_key"].encode(), password=None
    )
    message = f"{header}.{payload}".encode()
    signature = private_key.sign(message, padding.PKCS1v15(), hashes.SHA256())
    sig_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()

    return f"{header}.{payload}.{sig_b64}"


async def _get_access_token(service_account_json: dict) -> str:
    """Exchange a JWT for a Google access token."""
    jwt = _make_jwt(service_account_json)
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": jwt},
        )
        resp.raise_for_status()
        return resp.json()["access_token"]


class SheetsAppendRowNode(BaseNode):
    """Append a row to a Google Sheet.
    Config:
      service_account (JSON string or dict) — service account credentials,
      spreadsheet_id — the sheet ID from the URL,
      sheet_name (default 'Sheet1'),
      values — list of values OR comma-separated string
    Output: updated_range, updated_rows
    """
    node_type = "action.sheets_append_row"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)

        sa = cfg["service_account"]
        if isinstance(sa, str):
            sa = json.loads(sa)

        spreadsheet_id = cfg["spreadsheet_id"]
        sheet_name = cfg.get("sheet_name", "Sheet1")
        values = cfg["values"]

        if isinstance(values, str):
            values = [v.strip() for v in values.split(",")]

        token = await _get_access_token(sa)
        range_notation = f"{sheet_name}!A1"

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/{range_notation}:append",
                headers={"Authorization": f"Bearer {token}"},
                params={"valueInputOption": "USER_ENTERED", "insertDataOption": "INSERT_ROWS"},
                json={"values": [values]},
            )
            resp.raise_for_status()
            data = resp.json()

        updates = data.get("updates", {})
        return {
            "updated_range": updates.get("updatedRange", ""),
            "updated_rows": updates.get("updatedRows", 0),
            "spreadsheet_id": spreadsheet_id,
        }


class SheetsReadRangeNode(BaseNode):
    """Read a range of cells from a Google Sheet.
    Config: service_account (JSON), spreadsheet_id, range (e.g. 'Sheet1!A1:D10')
    Output: values (2D list), row_count, col_count
    """
    node_type = "action.sheets_read_range"

    async def execute(self, context: ExecutionContext) -> dict:
        cfg = context.resolve_dict(self.config)

        sa = cfg["service_account"]
        if isinstance(sa, str):
            sa = json.loads(sa)

        spreadsheet_id = cfg["spreadsheet_id"]
        range_notation = cfg.get("range", "Sheet1!A1:Z100")

        token = await _get_access_token(sa)

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/{range_notation}",
                headers={"Authorization": f"Bearer {token}"},
            )
            resp.raise_for_status()
            data = resp.json()

        values = data.get("values", [])
        return {
            "values": values,
            "row_count": len(values),
            "col_count": len(values[0]) if values else 0,
        }
