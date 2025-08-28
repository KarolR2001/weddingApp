from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class ChatMessage:
    role: str  # "user" | "assistant" | "system"
    content: str


@dataclass
class Slots:
    category: Optional[str] = None
    city: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None


@dataclass
class ChatSession:
    session_id: str
    messages: List[ChatMessage] = field(default_factory=list)
    summary: Optional[str] = None
    slots: Slots = field(default_factory=Slots)


class SessionStore:
    def __init__(self) -> None:
        self._sessions: Dict[str, ChatSession] = {}

    def get_or_create(self, session_id: str) -> ChatSession:
        if session_id not in self._sessions:
            self._sessions[session_id] = ChatSession(session_id=session_id)
        return self._sessions[session_id]

    def recent(self, session: ChatSession, keep_last: int) -> List[ChatMessage]:
        return session.messages[-keep_last:] if keep_last > 0 else []


store = SessionStore()


