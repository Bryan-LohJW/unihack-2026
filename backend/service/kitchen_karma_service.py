from constant.enum import DeleteReason
from constant.karma_rules import compute_karma_delta
from mongo_collection.repository.kitchen_karma_repository import KitchenKarmaRepository
from mongo_collection.schema.kitchen_karma_schema import KitchenKarmaSchema


class KitchenKarmaService:
    def __init__(self, db):
        self.repo = KitchenKarmaRepository(db)

    def get_score(self) -> dict:
        raw = self.repo.get()
        if not raw:
            raw = self.repo.ensure_exists()

        doc = KitchenKarmaSchema.from_db(raw).to_document()
        # Prefer stored score (unit-based); fallback to legacy wasted/consumed
        if raw and "score" in raw and raw["score"] is not None:
            score = raw["score"]
        else:
            score = (
                doc.get(DeleteReason.WASTED.value, 0) * -20
                + doc.get(DeleteReason.CONSUMED.value, 0) * 10
            )
        return {**doc, "score": score}

    def add_karma(self, amount: int | float, unit: str, reason: str) -> int:
        """
        Apply karma for amount/unit; reason is 'consumed' or 'wasted'.
        Returns the karma delta (positive for consumed, negative for wasted).
        """
        is_consumed = (reason or "").strip().lower() == DeleteReason.CONSUMED.value
        delta = compute_karma_delta(amount, unit or "pcs", is_consumed=is_consumed)
        self.repo.increment_score(delta)
        return delta

    def increment_wasted(self, amount: int = 1) -> dict:
        doc = self.repo.increment(DeleteReason.WASTED.value, amount)
        return KitchenKarmaSchema.from_db(doc).to_document()

    def increment_consumed(self, amount: int = 1) -> dict:
        doc = self.repo.increment(DeleteReason.CONSUMED.value, amount)
        return KitchenKarmaSchema.from_db(doc).to_document()
