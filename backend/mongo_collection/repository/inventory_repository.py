from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any


class InventoryRepository:
    def __init__(self, db):
        self.collection = db.inventory

    def insert_one(self, doc: Dict[str, Any]):
        return self.collection.insert_one(doc)

    def insert_many(self, docs: List[Dict[str, Any]]):
        if not docs:
            return None
        return self.collection.insert_many(docs)

    def find_in_fridge(self, section: str | None = None, expiry_within_days: int | None = None):
        query: Dict[str, Any] = {}
        if section is not None and section != "":
            query["section"] = section
        if expiry_within_days is not None:
            threshold = datetime.now(timezone.utc) + \
                timedelta(days=expiry_within_days)
            query["expiry_date"] = {"$lte": threshold}
        return list(self.collection.find(query))

    def find_one(self, object_id):
        return self.collection.find_one({"_id": object_id})

    def update_one(self, object_id, data: Dict[str, Any]):
        return self.collection.update_one({"_id": object_id}, {"$set": data})

    def delete_one(self, object_id):
        return self.collection.delete_one({"_id": object_id})

