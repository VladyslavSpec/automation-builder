from abc import ABC, abstractmethod
from dataclasses import dataclass, field
import re
import os


@dataclass
class ExecutionContext:
    trigger_data: dict = field(default_factory=dict)
    node_outputs: dict = field(default_factory=dict)
    variables: dict = field(default_factory=dict)

    def resolve(self, value):
        """Replace {{trigger.field}} and {{nodeId.field}} templates with actual values."""
        if not isinstance(value, str):
            return value

        def replacer(match):
            parts = match.group(1).split(".")
            source, key = parts[0], ".".join(parts[1:])
            if source == "trigger":
                return str(self.trigger_data.get(key, ""))
            if source == "vars":
                return str(self.variables.get(key, ""))
            if source == "env":
                # Only allow whitelisted env vars — never expose secrets
                ALLOWED_ENV = {"APP_ENV", "APP_NAME"}
                if key in ALLOWED_ENV:
                    return str(os.getenv(key, ""))
                return ""
            if source in self.node_outputs:
                return str(self.node_outputs[source].get(key, ""))
            return match.group(0)

        return re.sub(r"\{\{([\w.]+)\}\}", replacer, value)

    def resolve_dict(self, config: dict) -> dict:
        """Recursively resolve templates in a config dict."""
        result = {}
        for k, v in config.items():
            if isinstance(v, dict):
                result[k] = self.resolve_dict(v)
            elif isinstance(v, list):
                result[k] = [self.resolve(i) if isinstance(i, str) else i for i in v]
            else:
                result[k] = self.resolve(v)
        return result


class BaseNode(ABC):
    node_type: str = "base"

    def __init__(self, node_id: str, config: dict):
        self.node_id = node_id
        self.config = config

    @abstractmethod
    async def execute(self, context: ExecutionContext) -> dict:
        """Execute the node and return output dict."""
        ...
