from datetime import datetime, timedelta, timezone
from bson import ObjectId

from constant.enum import Section


class InventorySchema:
    def __init__(
        self,
        name: str,
        calories: int,
        section: str = Section.FRIDGE.value,
        expiry_days: int = 7,
        nutrition=None,
        qty: int = 1,
        image_url: str | None = None,
        _id=None,
    ):
        self._id = _id or ObjectId()
        self.name = name
        self.calories = calories
        section_val = section if isinstance(section, str) else (section.value if isinstance(section, Section) else Section.FRIDGE.value)
        self.section = section_val
        self.expiry_date = datetime.now(timezone.utc) + timedelta(days=expiry_days)
        self.added_at = datetime.now(timezone.utc)
        self.nutrition = nutrition
        self.qty = max(0, int(qty)) if qty is not None else 1
        self.image_url = image_url

    @staticmethod
    def from_request(data: dict) -> "InventorySchema":
        return InventorySchema(
            name=data.get("name"),
            calories=data.get("calories"),
            section=data.get("section", Section.FRIDGE.value),
            expiry_days=data.get("expiry_days", 7),
            nutrition=data.get("nutrition"),
            qty=data.get("qty", 1),
            image_url=data.get("image_url"),
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
            "qty": self.qty,
            "image_url": self.image_url,
        }

