from pymongo import ReturnDocument

from constant.enum import DeleteReason


class KitchenKarmaRepository:
    DOC_ID = "global"

    def __init__(self, db):
        self.collection = db.kitchen_karma

    def get(self):
        return self.collection.find_one({"_id": self.DOC_ID})

    def ensure_exists(self):
        return self.collection.find_one_and_update(
            {"_id": self.DOC_ID},
            {"$setOnInsert": {
                DeleteReason.WASTED.value: 0,
                DeleteReason.CONSUMED.value: 0,
                "score": 0,
            }},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )

    def increment_score(self, delta: int):
        return self.collection.find_one_and_update(
            {"_id": self.DOC_ID},
            {"$inc": {"score": delta}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )

    def increment(self, field: str, amount: int = 1):
        if field not in {DeleteReason.WASTED.value, DeleteReason.CONSUMED.value}:
            raise ValueError("field must be 'wasted' or 'consumed'")

        return self.collection.find_one_and_update(
            {"_id": self.DOC_ID},
            {"$inc": {field: amount}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )

