from bson import ObjectId

from mongo_collection.schema.recipe_suggestion_schema import RecipeSuggestionSchema
from mongo_collection.repository.recipe_suggestion_repository import RecipeSuggestionRepository
from mongo_collection.repository.inventory_repository import InventoryRepository
from service.llm_client import suggest_recipes_from_inventory


class RecipeSuggestionService:
    def __init__(self, db):
        self.repo = RecipeSuggestionRepository(db)
        self.inventory_repo = InventoryRepository(db)

    def run_cron_suggestions(self) -> list[dict]:
        """
        Query whole inventory, feed to LLM for recipe suggestions,
        store RecipeSuggestions and return them (for notifications).
        """
        inventory_items = self.inventory_repo.find_in_fridge()
        # Normalize for LLM: list of dicts with name, qty, expiry_date, etc.
        inventory_payload = [
            {
                "name": item.get("name"),
                "qty": item.get("qty", 1),
                "expiry_date": item.get("expiry_date"),
                "section": item.get("section"),
            }
            for item in inventory_items
        ]

        recipes = suggest_recipes_from_inventory(inventory_payload)
        if not recipes:
            return []

        suggestion_id = str(ObjectId())
        docs = []
        for schema in recipes:
            if isinstance(schema, RecipeSuggestionSchema):
                schema.suggestion_id = suggestion_id
                docs.append(schema.to_document())
            else:
                # Legacy: dict from LLM/Spoonacular
                mapped = _map_llm_recipe_to_schema(schema)
                s = RecipeSuggestionSchema.from_llm_response(mapped, suggestion_id=suggestion_id)
                docs.append(s.to_document())

        self.repo.insert_many(docs)

        # Return inserted docs as JSON-friendly (for cron/notification)
        return [_serialize_suggestion_doc(d) for d in docs]


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
