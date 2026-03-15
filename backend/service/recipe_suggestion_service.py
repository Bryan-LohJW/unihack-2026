from bson import ObjectId

from ai_models.generate_recipe import generate_recipe
from mongo_collection.schema.recipe_suggestion_schema import RecipeSuggestionSchema
from mongo_collection.repository.recipe_suggestion_repository import RecipeSuggestionRepository
from mongo_collection.repository.inventory_repository import InventoryRepository
from mongo_collection.repository.preference_repository import PreferenceRepository


class RecipeSuggestionService:
    def __init__(self, db):
        self.repo = RecipeSuggestionRepository(db)
        self.inventory_repo = InventoryRepository(db)
        self.preference_repo = PreferenceRepository(db)

    def run_cron_suggestions(self,
                             cuisine: list[str],
                             dietary_requirements: list[str],
                             headcount: int
                             ) -> tuple[dict | None, int]:
        """
        Query whole inventory, feed to LLM for recipe suggestions,
        store RecipeSuggestions and return them (for notifications).
        Returns (data_dict, status_code). data_dict is None on 404.
        """
        inventory_items = self.inventory_repo.find_in_fridge()
        if not inventory_items:
            return ({"error": "No inventory items found"}, 404)

        # headcount <= 0 is a flag condition when the logic is triggered by background cron instead of user actively requesting.
        if headcount <= 0 or (not cuisine and not dietary_requirements):
            prefs = self.preference_repo.find_one()
            if prefs:
                headcount = prefs.get("default_service", 1)
                cuisine = list(prefs.get("cuisine", [])) or []
                dietary_requirements = list(prefs.get("dietary", [])) or []


        result = generate_recipe(
            inventory_items,
            cuisine,
            dietary_requirements,
            headcount,
        )

        if not result:
            return ([], 200)

        suggestion_id = str(ObjectId())
        docs = []
        for recipe in result.get("recipes", []):
            schema = RecipeSuggestionSchema.from_llm_response(
                recipe, suggestion_id=suggestion_id)
            self.repo.insert_one(schema.to_document())
            docs.append(schema.to_json_friendly())

        return ({"suggestion_id": suggestion_id, "recipes": docs}, 200)
