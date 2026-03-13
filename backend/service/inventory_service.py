from bson import ObjectId

from constant.enum import DeleteReason
from mongo_collection.schema.inventory_schema import InventorySchema
from mongo_collection.repository.inventory_repository import InventoryRepository
from mongo_collection.repository.kitchen_karma_repository import KitchenKarmaRepository


class InventoryService:
    def __init__(self, db):
        self.repo = InventoryRepository(db)
        self.karma_repo = KitchenKarmaRepository(db)

    def create_item(self, data: dict) -> dict:
        schema = InventorySchema.from_request(data or {})
        doc = schema.to_document()
        result = self.repo.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    def create_items_batch(self, data) -> dict:
        if not isinstance(data, list):
            raise ValueError("Expected a list of items")

        docs = []
        for entry in data:
            schema = InventorySchema.from_request(entry or {})
            docs.append(schema.to_document())

        if not docs:
            return {"inserted_count": 0}

        result = self.repo.insert_many(docs)
        return {"inserted_count": len(result.inserted_ids)}

    def list_in_fridge(self):
        return self.repo.find_in_fridge()

    def get_by_id(self, item_id: str):
        return self.repo.find_one(ObjectId(item_id))

    def update_item(self, item_id: str, data: dict):
        oid = ObjectId(item_id)
        self.repo.update_one(oid, data or {})
        return self.repo.find_one(oid)

    def delete_item(self, item_id: str, reason: str | None = None):
        oid = ObjectId(item_id)
        existing = self.repo.find_one(oid)
        if not existing:
            return None

        self.repo.delete_one(oid)

        if reason:
            reason_norm = reason.strip().lower()
            if reason_norm == DeleteReason.WASTED.value.lower():
                self.karma_repo.increment("wasted", 1)
            elif reason_norm == DeleteReason.CONSUMED.value.lower():
                self.karma_repo.increment("consumed", 1)

        return existing

