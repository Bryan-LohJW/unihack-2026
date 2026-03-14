from typing import Any, Dict, List

from bson import ObjectId


class RecipeRepository:
    def __init__(self, db):
        self.collection = db.recipes

    def insert_one(self, doc: Dict[str, Any]):
        return self.collection.insert_one(doc)

    def find_all(self) -> List[Dict[str, Any]]:
        return list(self.collection.find())

    def find_one(self, recipe_id: str | ObjectId) -> Dict[str, Any] | None:
        oid = ObjectId(recipe_id) if not isinstance(recipe_id, ObjectId) else recipe_id
        return self.collection.find_one({"_id": oid})

    def delete_one(self, recipe_id: str | ObjectId):
        oid = ObjectId(recipe_id) if not isinstance(recipe_id, ObjectId) else recipe_id
        return self.collection.delete_one({"_id": oid})