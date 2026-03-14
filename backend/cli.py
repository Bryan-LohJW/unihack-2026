"""
CLI command: check for expired unused inventory items.

Run daily via cron or manually:
    flask check-expired

See PRD Section 13.7.
"""

import click
from datetime import datetime, timezone

from db import mongo
from util.logger import log_event


def register_cli_commands(app):
    """Register custom Flask CLI commands."""

    @app.cli.command("check-expired")
    def check_expired():
        """Scan inventory for items past their expiry date with qty > 0, log events."""
        now = datetime.now(timezone.utc)
        query = {
            "expiry_date": {"$lt": now},
            "qty": {"$gt": 0},
            "depleted": {"$ne": True},
        }
        expired_items = list(mongo.db.inventory.find(query))

        if not expired_items:
            click.echo("No expired unused items found.")
            return

        for item in expired_items:
            log_event(
                event_type="item_expired_unused",
                user_id=item.get("user_id", ""),
                session_id="",
                payload={
                    "item_name": item.get("name", ""),
                    "qty_remaining": item.get("qty", 0),
                    "expiry_date": item.get("expiry_date", "").isoformat()
                    if hasattr(item.get("expiry_date", ""), "isoformat")
                    else str(item.get("expiry_date", "")),
                    "added_at": item.get("added_at", "").isoformat()
                    if hasattr(item.get("added_at", ""), "isoformat")
                    else str(item.get("added_at", "")),
                },
            )

            # Mark as expired in inventory
            mongo.db.inventory.update_one(
                {"_id": item["_id"]},
                {"$set": {"expired": True}},
            )

        click.echo(f"Logged {len(expired_items)} expired unused item(s).")
