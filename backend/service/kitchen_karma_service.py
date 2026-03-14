from constant.enum import DeleteReason
from mongo_collection.repository.kitchen_karma_repository import KitchenKarmaRepository
from mongo_collection.schema.kitchen_karma_schema import KitchenKarmaSchema


class KitchenKarmaService:
    def __init__(self, db):
        self.repo = KitchenKarmaRepository(db)

    def get_score(self) -> dict:
        doc = self.repo.get()
        if not doc:
            doc = self.repo.ensure_exists()

        doc = KitchenKarmaSchema.from_db(doc).to_document()

        score = doc.get(DeleteReason.WASTED.value) * -20 + \
            doc.get(DeleteReason.CONSUMED.value) * 10

        return {**doc, "score": score}

    def increment_wasted(self, amount: int = 1) -> dict:
        doc = self.repo.increment(DeleteReason.WASTED.value, amount)
        return KitchenKarmaSchema.from_db(doc).to_document()

    def increment_consumed(self, amount: int = 1) -> dict:
        doc = self.repo.increment(DeleteReason.CONSUMED.value, amount)
        return KitchenKarmaSchema.from_db(doc).to_document()
