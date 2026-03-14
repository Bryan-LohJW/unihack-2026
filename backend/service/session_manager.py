"""
Session management for multi-turn recipe recommendation.
See PRD Section 9.
"""

import uuid
from datetime import datetime, timezone

from db import mongo
from util.logger import log_event

SESSION_TTL_SECONDS = 1800  # 30 minutes


def _as_utc(dt: datetime) -> datetime:
    """MongoDB returns naive datetimes (stored as UTC). Make them timezone-aware."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def get_active_session(session_id: str) -> dict | None:
    """Return the session if it exists and is still active, else None.

    If the session has been inactive for > 30 minutes it is marked expired
    and None is returned — the caller must create a new session.
    """
    session = mongo.db.sessions.find_one({"session_id": session_id})
    if not session:
        return None

    elapsed = (datetime.now(timezone.utc) - _as_utc(session["last_active"])).total_seconds()
    if elapsed > SESSION_TTL_SECONDS:
        mongo.db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"expired": True}},
        )
        log_event(
            event_type="session_expired",
            user_id=session.get("user_id", ""),
            session_id=session_id,
            payload={
                "duration_seconds": int(
                    (datetime.now(timezone.utc) - _as_utc(session["created_at"])).total_seconds()
                ),
                "recipes_shown": len(session.get("conversation_history", [])),
                "recipes_cooked": 0,
            },
        )
        return None
    return session


def create_session(user_id: str, inventory_snapshot: list[dict]) -> dict:
    """Create a new recipe session and log the session_started event."""
    now = datetime.now(timezone.utc)
    session_id = str(uuid.uuid4())
    session = {
        "session_id": session_id,
        "user_id": user_id,
        "inventory_snapshot": inventory_snapshot,
        "conversation_history": [],
        "created_at": now,
        "last_active": now,
        "expired": False,
    }
    mongo.db.sessions.insert_one(session)

    log_event(
        event_type="session_started",
        user_id=user_id,
        session_id=session_id,
        payload={"inventory_snapshot": inventory_snapshot},
    )
    return session


def touch_session(session_id: str):
    """Update last_active timestamp to keep session alive."""
    mongo.db.sessions.update_one(
        {"session_id": session_id},
        {"$set": {"last_active": datetime.now(timezone.utc)}},
    )


def append_to_history(session_id: str, role: str, content: str):
    """Append a message to the conversation history."""
    mongo.db.sessions.update_one(
        {"session_id": session_id},
        {"$push": {"conversation_history": {"role": role, "content": content}}},
    )
