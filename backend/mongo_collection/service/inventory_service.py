from bson import ObjectId

from mongo_collection.schema.inventory_schema import InventorySchema
from mongo_collection.repository.inventory_repository import InventoryRepository


class InventoryService:
    def __init__(self, db):
        self.repo = InventoryRepository(db)

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

    def delete_item(self, item_id: str):
        return self.repo.delete_one(ObjectId(item_id))

