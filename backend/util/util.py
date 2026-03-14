from datetime import datetime


def reponse_serializer(doc: dict) -> dict:
    """Convert Mongo document to JSON-serializable inventory item."""
    item = dict(doc)
    if "_id" in item:
        item["_id"] = str(item["_id"])
    if "expiry_date" in item and isinstance(item["expiry_date"], datetime):
        item["expiry_date"] = item["expiry_date"].isoformat()
    if "added_at" in item and isinstance(item["added_at"], datetime):
        item["added_at"] = item["added_at"].isoformat()
    return item