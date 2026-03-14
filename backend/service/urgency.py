"""
Urgency ranking algorithm — pure Python, no LLM.
See PRD Section 6.
"""

from datetime import datetime, timezone


def run_urgency_ranking(inventory_items: list[dict]) -> tuple[list[dict], list[str]]:
    """Rank inventory items by expiry urgency.

    Returns:
        (ranked_items, expired_warnings)
        - ranked_items: list sorted by urgency (CRITICAL first), excluding expired.
        - expired_warnings: names of items that are already expired.
    """
    ranked = []
    expired_warnings = []

    today = datetime.now(timezone.utc).date()

    for item in inventory_items:
        expiry_date = item.get("expiry_date")
        if expiry_date is None:
            continue

        if isinstance(expiry_date, str):
            expiry_date = datetime.fromisoformat(expiry_date)
        if hasattr(expiry_date, "date"):
            expiry_date = expiry_date.date()

        days_remaining = (expiry_date - today).days

        if days_remaining < 0:
            expired_warnings.append(item.get("name", "Unknown"))
            continue

        if days_remaining <= 1:
            urgency, weight = "CRITICAL", 1.0
        elif days_remaining <= 3:
            urgency, weight = "HIGH", 0.75
        elif days_remaining <= 6:
            urgency, weight = "MODERATE", 0.5
        else:
            urgency, weight = "LOW", 0.1

        ranked.append({
            "item": item.get("name", "Unknown"),
            "qty": item.get("qty", 1),
            "unit": item.get("unit", "pieces"),
            "urgency": urgency,
            "expires_in_days": days_remaining,
            "_weight": weight,
        })

    ranked.sort(key=lambda x: -x["_weight"])
    for r in ranked:
        del r["_weight"]

    return ranked, expired_warnings
