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

    def find_in_fridge(self):
        return list(self.collection.find({}))

    def find_one(self, object_id):
        return self.collection.find_one({"_id": object_id})

    def update_one(self, object_id, data: Dict[str, Any]):
        return self.collection.update_one({"_id": object_id}, {"$set": data})

    def delete_one(self, object_id):
        return self.collection.delete_one({"_id": object_id})

