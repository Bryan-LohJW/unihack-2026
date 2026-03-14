from typing import Any


class PreferenceSchema:
    """Schema for user recipe preferences (cuisine, dietary, default servings)."""

    def __init__(
        self,
        cuisine: list[str] | None = None,
        dietary: list[str] | None = None,
        default_serving: int = 1,
        _id: str = "global",
    ):
        self._id = _id
        self.default_serving = default_serving
        self.cuisine = cuisine or []
        self.dietary = dietary or []
        self.default_serving = default_serving

    @staticmethod
    def from_db(doc: dict | None) -> "PreferenceSchema":
        doc = doc or {}
        return PreferenceSchema(
            _id=str(doc.get("_id", "global")),
            default_serving=doc.get("default_serving", 1),
            cuisine=list(doc.get("cuisine", [])) if isinstance(doc.get("cuisine"), list) else [],
            dietary=list(doc.get("dietary", [])) if isinstance(
                doc.get("dietary"), list) else [],
        )

    def to_document(self) -> dict[str, Any]:
        return {
            "_id": self._id,
            "default_serving": self.default_serving,
            "cuisine": self.cuisine,
            "dietary": self.dietary,
            "default_serving": self.default_serving,
        }
