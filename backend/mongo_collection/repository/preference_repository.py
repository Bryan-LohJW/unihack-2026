from pymongo import ReturnDocument


class PreferenceRepository:
    DOC_ID = "global"

    def __init__(self, db):
        self.collection = db.preferences

    def find_one(self) -> dict | None:
        return self.collection.find_one({"_id": self.DOC_ID})

    def update(self, data: dict) -> dict | None:
        """Update the preference document. Upserts if not exists."""
        if not data:
            return self.find_one()

        update_fields = {}
        default_serving = data.get(
            "default_serving") or data.get("defaultServings")
        if default_serving is not None:
            update_fields["default_serving"] = int(default_serving or 1)
        if "cuisine" in data:
            update_fields["cuisine"] = list(data["cuisine"]) if isinstance(data["cuisine"], list) else []
        if "dietary" in data or "dietary_requirements" in data:
            val = data.get("dietary") or data.get("dietary_requirements")
            update_fields["dietary"] = list(val) if isinstance(val, list) else []
        default_serving = data.get("default_serving")
        if default_serving is not None:
            update_fields["default_serving"] = int(1)

        if not update_fields:
            return self.find_one()

        result = self.collection.find_one_and_update(
            {"_id": self.DOC_ID},
            {"$set": update_fields},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        return result

    def delete(self) -> bool:
        """Delete the preference document. Returns True if deleted."""
        result = self.collection.delete_one({"_id": self.DOC_ID})
        return result.deleted_count > 0

    def seed_defaults(self) -> None:
        """Seed default preference values only if the document does not exist."""
        self.collection.update_one(
            {"_id": self.DOC_ID},
            {
                "$setOnInsert": {
                    "default_serving": 1,
                    "cuisine": ["Chinese", "Thai", "Indonesian"],
                    "dietary": [],
                    "default_serving": 1,
                }
            },
            upsert=True,
        )
