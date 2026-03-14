from bson import ObjectId

from mongo_collection.schema.recipe_schema import RecipeSchema
from mongo_collection.repository.recipe_repository import RecipeRepository


class RecipeService:
    def __init__(self, db):
        self.repo = RecipeRepository(db)

    def create_recipe(self, data: dict) -> dict:
        schema = RecipeSchema.from_request(data or {})
        doc = schema.to_document()
        result = self.repo.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    def list_recipes(self) -> list[dict]:
        return self.repo.find_all()

    def get_recipe(self, recipe_id: str) -> dict | None:
        return self.repo.find_one(ObjectId(recipe_id))

    def delete_recipe(self, recipe_id: str) -> bool:
        result = self.repo.delete_one(ObjectId(recipe_id))
        return result.deleted_count > 0

