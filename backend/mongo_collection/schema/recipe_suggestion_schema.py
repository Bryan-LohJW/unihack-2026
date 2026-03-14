from datetime import datetime, timezone
from bson import ObjectId
from typing import Any


class RecipeSuggestionSchema:
    """
    Schema for LLM-generated recipe suggestions.
    Fields: menu, headcount, cuisine_type, nutrition_per_person,
    ingredients (list of {name, qty}), ingredients_to_buy (list of {name, qty}),
    instruction (list of str), image_url (str).
    """

    def __init__(
        self,
        menu: str,
        headcount: int,
        cuisine_type: str,
        nutrition_per_person: dict[str, Any],
        ingredients: list[dict[str, Any]],
        ingredients_to_buy: list[dict[str, Any]],
        instruction: list[str] | None = None,
        image_url: str | None = None,
        suggestion_id: str | None = None,
        _id: Any = None,
        created_at: datetime | None = None,
    ):
        self._id = _id or ObjectId()
        self.suggestion_id = suggestion_id
        self.menu = menu
        self.headcount = headcount
        self.cuisine_type = cuisine_type
        self.nutrition_per_person = nutrition_per_person or {}
        self.ingredients = list(ingredients or [])
        self.ingredients_to_buy = list(ingredients_to_buy or [])
        self.instruction = list(instruction or [])
        self.image_url = image_url or ""
        self.created_at = created_at or datetime.now(timezone.utc)

    @staticmethod
    def from_llm_response(data: dict, suggestion_id: str | None = None) -> "RecipeSuggestionSchema":
        data = data or {}
        return RecipeSuggestionSchema(
            suggestion_id=suggestion_id,
            menu=data.get("menu", ""),
            headcount=int(data.get("headcount", 1) or 1),
            cuisine_type=data.get("cuisine_type", ""),
            nutrition_per_person=data.get("nutrition_per_person") or {},
            ingredients=data.get("ingredients") or [],
            ingredients_to_buy=data.get("ingredients_to_buy") or [],
            instruction=data.get("instruction") or [],
            image_url=data.get("image_url") or "",
        )

    def to_document(self) -> dict:
        doc = {
            "_id": self._id,
            "menu": self.menu,
            "headcount": self.headcount,
            "cuisine_type": self.cuisine_type,
            "nutrition_per_person": self.nutrition_per_person,
            "ingredients": self.ingredients,
            "ingredients_to_buy": self.ingredients_to_buy,
            "instruction": self.instruction,
            "image_url": self.image_url,
            "created_at": self.created_at,
        }
        if self.suggestion_id is not None:
            doc["suggestion_id"] = self.suggestion_id
        return doc

    def to_json_friendly(self) -> dict:
        d = self.to_document()
        d["_id"] = str(d["_id"])
        if isinstance(d.get("created_at"), datetime):
            d["created_at"] = d["created_at"].isoformat()
        return d

    @staticmethod
    def doc_to_api_recipe(doc: dict) -> dict:
        """
        Convert a mongo document to API response format. Single source of truth for
        recipe API shape. Add new fields in to_document; they will appear here.
        """
        out = {}
        for k, v in doc.items():
            if k == "_id":
                continue
            if k == "created_at" and hasattr(v, "isoformat"):
                v = v.isoformat()
            out[k] = v
        out["id"] = str(doc.get("_id", ""))
        return out
