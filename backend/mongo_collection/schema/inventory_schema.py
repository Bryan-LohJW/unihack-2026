from datetime import datetime, timedelta, timezone
from bson import ObjectId

from constant.enum import Section


class InventorySchema:
    def __init__(
        self,
        name: str,
        calories: int,
        section: str = "fridge",
        expiry_days: int = 7,
        nutrition=None,
        _id=None,
    ):
        self._id = _id or ObjectId()
        self.name = name
        self.calories = calories
        self.section = section if isinstance(
            section, Section) else Section(section).value,
        self.expiry_date = datetime.now(timezone.utc) + timedelta(days=expiry_days)
        self.added_at = datetime.now(timezone.utc)
        self.nutrition = nutrition or {
            "protein": 10,
            "carbs": 20,
            "fat": 30,
        }

    @staticmethod
    def from_request(data: dict) -> "InventorySchema":
        return InventorySchema(
            name=data.get("name"),
            calories=data.get("calories"),
            section=data.get("section", "fridge"),
            expiry_days=data.get("expiry_days", 7),
            nutrition=data.get("nutrition"),
        )

    def to_document(self) -> dict:
        return {
            "_id": self._id,
            "name": self.name,
            "calories": self.calories,
            "section": self.section,
            "expiry_date": self.expiry_date,
            "added_at": self.added_at,
            "nutrition": self.nutrition,
        }

