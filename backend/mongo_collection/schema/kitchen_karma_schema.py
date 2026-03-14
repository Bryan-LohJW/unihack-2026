from constant.enum import DeleteReason


class KitchenKarmaSchema:
    def __init__(self, wasted: int = 0, consumed: int = 0, _id: str = "global"):
        self._id = _id
        self.wasted = wasted
        self.consumed = consumed

    @staticmethod
    def from_db(doc: dict | None) -> "KitchenKarmaSchema":
        doc = doc or {}
        return KitchenKarmaSchema(
            _id=doc.get("_id", "global"),
            wasted=int(doc.get(DeleteReason.WASTED.value, 0) or 0),
            consumed=int(doc.get(DeleteReason.CONSUMED.value, 0) or 0),
        )

    def to_document(self) -> dict:
        return {"_id": self._id, DeleteReason.WASTED.value: self.wasted, DeleteReason.CONSUMED.value: self.consumed}
