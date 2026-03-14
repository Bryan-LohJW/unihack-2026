from typing import List, Dict, Any


class RecipeSuggestionRepository:
    def __init__(self, db):
        self.collection = db.recipe_suggestions

    def insert_one(self, doc: Dict[str, Any]):
        return self.collection.insert_one(doc)

    def insert_many(self, docs: List[Dict[str, Any]]):
        if not docs:
            return []
        result = self.collection.insert_many(docs)
        return list(result.inserted_ids)

    def find_recent(self, limit: int = 50):
        return list(
            self.collection.find().sort("created_at", -1).limit(limit)
        )
