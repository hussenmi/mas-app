from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class Session:
    history: List[Dict[str, str]] = field(default_factory=list)
    attributes: Dict[str, str] = field(default_factory=dict)


class SessionStore:
    def __init__(self, history_limit: int = 8):
        self._sessions: Dict[str, Session] = {}
        self._history_limit = history_limit

    def get(self, session_id: str) -> Session:
        if session_id not in self._sessions:
            self._sessions[session_id] = Session()
        return self._sessions[session_id]

    def append(self, session_id: str, role: str, content: str) -> None:
        session = self.get(session_id)
        session.history.append({"role": role, "content": content})
        if len(session.history) > self._history_limit:
            session.history = session.history[-self._history_limit:]

    def reset(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)

    def active_sessions(self) -> int:
        return len(self._sessions)
