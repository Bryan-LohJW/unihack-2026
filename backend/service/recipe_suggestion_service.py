from bson import ObjectId

from ai_models.generate_recipe import generate_recipe
from mongo_collection.schema.recipe_suggestion_schema import RecipeSuggestionSchema
from mongo_collection.repository.recipe_suggestion_repository import RecipeSuggestionRepository
from mongo_collection.repository.inventory_repository import InventoryRepository
from mongo_collection.repository.preference_repository import PreferenceRepository
from service.llm_client import suggest_recipes_from_inventory


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



def _map_llm_recipe_to_schema(raw: dict) -> dict:
    """Map suggest_recipes_from_inventory recipe format to RecipeSuggestionSchema format.
    Handles both: (1) schema format (menu, ingredients, etc.) and
    (2) LLM/Spoonacular format (name, ingredients_used, missing_ingredients, steps).
    """
    # Already in schema format (e.g. from dummy or future unified output)
    if "ingredients" in raw and "menu" in raw:
        return {
            "menu": raw.get("menu", ""),
            "headcount": raw.get("headcount", 1),
            "cuisine_type": raw.get("cuisine_type", ""),
            "nutrition_per_person": raw.get("nutrition_per_person") or {},
            "ingredients": raw.get("ingredients", []),
            "ingredients_to_buy": raw.get("ingredients_to_buy", []),
            "instruction": raw.get("instruction", []),
            "image_url": raw.get("image_url", ""),
        }

    # LLM/Spoonacular format
    ingredients_used = raw.get("ingredients_used") or []
    ingredients = [
        {"name": ing.get("item", ""), "qty": ing.get("qty_used", 1)}
        for ing in ingredients_used
    ]
    missing = raw.get("missing_ingredients") or []
    ingredients_to_buy = [{"name": m, "qty": ""} for m in missing]
    instruction = raw.get("steps") or raw.get("instruction") or []
    if isinstance(instruction, str):
        instruction = [instruction] if instruction else []
    image_url = raw.get("image_url") or ""

    return {
        "menu": raw.get("name") or raw.get("menu", ""),
        "headcount": raw.get("servings") or raw.get("headcount", 1),
        "cuisine_type": raw.get("cuisine_type", ""),
        "nutrition_per_person": raw.get("nutrition_per_person") or {},
        "ingredients": ingredients,
        "ingredients_to_buy": ingredients_to_buy,
        "instruction": instruction,
        "image_url": image_url,
    }


def _serialize_suggestion_doc(doc: dict) -> dict:
    out = dict(doc)
    if "_id" in out:
        out["_id"] = str(out["_id"])
    if "created_at" in out and hasattr(out["created_at"], "isoformat"):
        out["created_at"] = out["created_at"].isoformat()
    return out
