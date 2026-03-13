from datetime import datetime, timedelta
from bson import ObjectId


class InventorySchema:
    def __init__(
        self,
        name: str,
        calories: int,
        section: str = "fridge",
        expiry_days: int = 7,
        nutrition=None,
        status: str = "in_fridge",
        _id=None,
    ):
        self._id = _id or ObjectId()
        self.name = name
        self.calories = calories
        self.section = section
        self.expiry_date = datetime.utcnow() + timedelta(days=expiry_days)
        self.added_at = datetime.utcnow()
        self.status = status
        self.nutrition = nutrition or {
            "protein": 0,
            "carbs": 0,
            "fat": 0,
        }

    @staticmethod
    def from_request(data: dict) -> "InventorySchema":
        return InventorySchema(
            name=data.get("name"),
            calories=data.get("calories"),
            section=data.get("section", "fridge"),
            expiry_days=data.get("expiry_days", 7),
            nutrition=data.get("nutrition"),
            status=data.get("status", "in_fridge"),
        )

    def to_document(self) -> dict:
        return {
            "_id": self._id,
            "name": self.name,
            "calories": self.calories,
            "section": self.section,
            "expiry_date": self.expiry_date,
            "added_at": self.added_at,
            "status": self.status,
            "nutrition": self.nutrition,
        }

