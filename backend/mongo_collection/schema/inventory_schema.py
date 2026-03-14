from datetime import datetime, timedelta, timezone
from bson import ObjectId

from constant.enum import Section


class InventorySchema:
    def __init__(
        self,
        name: str,
        section: str = Section.FRIDGE.value,
        expiry_days: int = 7,
        qty: int = 1,
        unit: str | None = None,
        image_url: str | None = None,
        _id=None,
    ):
        self._id = _id or ObjectId()
        self.name = name
        section_val = section if isinstance(section, str) else (section.value if isinstance(section, Section) else Section.FRIDGE.value)
        self.section = section_val
        self.expiry_date = datetime.now(timezone.utc) + timedelta(days=expiry_days)
        self.added_at = datetime.now(timezone.utc)
        self.qty = max(0, int(qty)) if qty is not None else 1
        self.unit = unit
        self.image_url = image_url

    @staticmethod
    def from_request(data: dict) -> "InventorySchema":
        return InventorySchema(
            name=data.get("name"),
            section=data.get("section", Section.FRIDGE.value),
            expiry_days=data.get("expiry_days", 7),
            qty=data.get("qty", 1),
            unit=data.get("unit"),
            image_url=data.get("image_url"),
        )

    def to_document(self) -> dict:
        return {
            "_id": self._id,
            "name": self.name,
            "section": self.section,
            "expiry_date": self.expiry_date,
            "added_at": self.added_at,
            "qty": self.qty,
            "unit": self.unit,
            "image_url": self.image_url,
        }

