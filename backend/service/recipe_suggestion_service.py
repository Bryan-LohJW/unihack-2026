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

        suggestions_payload = suggest_recipes_from_inventory(inventory_payload)
        if not suggestions_payload:
            return []

        suggestion_id = str(ObjectId())
        docs = []
        for raw in suggestions_payload:
            schema = RecipeSuggestionSchema.from_llm_response(raw, suggestion_id=suggestion_id)
            docs.append(schema.to_document())

        self.repo.insert_many(docs)

        # Return inserted docs as JSON-friendly (for cron/notification)
        return [_serialize_suggestion_doc(d) for d in docs]


def _serialize_suggestion_doc(doc: dict) -> dict:
    out = dict(doc)
    if "_id" in out:
        out["_id"] = str(out["_id"])
    if "created_at" in out and hasattr(out["created_at"], "isoformat"):
        out["created_at"] = out["created_at"].isoformat()
    return out
