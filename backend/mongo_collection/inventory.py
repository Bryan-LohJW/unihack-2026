from datetime import datetime, timedelta
from bson import ObjectId


class Inventory:
    def __init__(self, name, calories, section="fridge", expiry_days=7, nutrition=None, status="in_fridge", _id=None):
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
            "fat": 0
        }

    def to_dict(self):
        return {
            "_id": self._id,
            "name": self.name,
            "calories": self.calories,
            "section": self.section,
            "expiry_date": self.expiry_date,
            "added_at": self.added_at,
            "status": self.status,
            "nutrition": self.nutrition
        }

    @staticmethod
    def from_db(data):
        return Inventory(
            name=data.get("name"),
            calories=data.get("calories"),
            section=data.get("section"),
            expiry_days=0,
            nutrition=data.get("nutrition"),
            status=data.get("status"),
            _id=data.get("_id")
        )
