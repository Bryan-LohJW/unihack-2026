from pymongo import ReturnDocument


class KitchenKarmaRepository:
    """
    Stores a single counters document in the `kitchen_karma` collection.
    Fields: wasted (int), consumed (int)
    """

    DOC_ID = "global"

    def __init__(self, db):
        self.collection = db.kitchen_karma

    def get(self):
        doc = self.collection.find_one({"_id": self.DOC_ID})
        if not doc:
            doc = {"_id": self.DOC_ID, "wasted": 0, "consumed": 0}
            self.collection.insert_one(doc)
        return doc

    def increment(self, field: str, amount: int = 1):
        if field not in {"wasted", "consumed"}:
            raise ValueError("field must be 'wasted' or 'consumed'")

        return self.collection.find_one_and_update(
            {"_id": self.DOC_ID},
            {"$inc": {field: amount}, "$setOnInsert": {"wasted": 0, "consumed": 0}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )

