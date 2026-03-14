"""
Event logger — writes immutable event records to the MongoDB `events` collection.
See PRD Section 13.
"""

from datetime import datetime, timezone
import uuid

from db import mongo


def log_event(event_type: str, user_id: str, session_id: str, payload: dict):
    """Fire-and-forget event write to mongo.db.events."""
    event = {
        "event_id": str(uuid.uuid4()),
        "user_id": user_id,
        "session_id": session_id,
        "event_type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payload": payload,
    }
    mongo.db.events.insert_one(event)


def ensure_event_indexes():
    """Create recommended indexes on the events collection (call once at startup)."""
    mongo.db.events.create_index([("user_id", 1), ("timestamp", -1)])
    mongo.db.events.create_index([("event_type", 1), ("timestamp", -1)])
    mongo.db.events.create_index([("session_id", 1)])
