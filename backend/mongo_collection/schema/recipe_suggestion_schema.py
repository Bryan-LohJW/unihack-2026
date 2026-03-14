from datetime import datetime, timezone
from bson import ObjectId
from typing import Any


class RecipeSuggestionSchema:
    """
    Schema for LLM-generated recipe suggestions.
    Fields: menu, headcount, cuisine_type, nutrition_per_person,
    ingredients (list of {name, qty}), ingredients_to_buy (list of {name, qty}).
    """

    def __init__(
        self,
        menu: str,
        headcount: int,
        cuisine_type: str,
        nutrition_per_person: dict[str, Any],
        ingredients: list[dict[str, Any]],
        ingredients_to_buy: list[dict[str, Any]],
        _id: Any = None,
        created_at: datetime | None = None,
    ):
        self._id = _id or ObjectId()
        self.menu = menu
        self.headcount = headcount
        self.cuisine_type = cuisine_type
        self.nutrition_per_person = nutrition_per_person or {}
        self.ingredients = list(ingredients or [])
        self.ingredients_to_buy = list(ingredients_to_buy or [])
        self.created_at = created_at or datetime.now(timezone.utc)

    @staticmethod
    def from_llm_response(data: dict) -> "RecipeSuggestionSchema":
        data = data or {}
        return RecipeSuggestionSchema(
            menu=data.get("menu", ""),
            headcount=int(data.get("headcount", 1) or 1),
            cuisine_type=data.get("cuisine_type", ""),
            nutrition_per_person=data.get("nutrition_per_person") or {},
            ingredients=data.get("ingredients") or [],
            ingredients_to_buy=data.get("ingredients_to_buy") or [],
        )

    def to_document(self) -> dict:
        return {
            "_id": self._id,
            "menu": self.menu,
            "headcount": self.headcount,
            "cuisine_type": self.cuisine_type,
            "nutrition_per_person": self.nutrition_per_person,
            "ingredients": self.ingredients,
            "ingredients_to_buy": self.ingredients_to_buy,
            "created_at": self.created_at,
        }

    def to_json_friendly(self) -> dict:
        d = self.to_document()
        d["_id"] = str(d["_id"])
        if isinstance(d.get("created_at"), datetime):
            d["created_at"] = d["created_at"].isoformat()
        return d
