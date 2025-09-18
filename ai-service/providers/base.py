from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

from config import Settings
from memory import SessionStore
from tools import ToolRegistry


@dataclass
class ChatResult:
    message: str
    used_tools: List[str] = field(default_factory=list)


class ChatProvider:
    def __init__(self, settings: Settings, session_store: SessionStore, tool_registry: ToolRegistry):
        self.settings = settings
        self.session_store = session_store
        self.tool_registry = tool_registry

    def generate(self, message: str, session_id: str) -> ChatResult:  # pragma: no cover - interface
        raise NotImplementedError
