from datetime import datetime, timezone

from bson import ObjectId

from constant.enum import DeleteReason
from mongo_collection.schema.inventory_schema import InventorySchema
from mongo_collection.repository.inventory_repository import InventoryRepository
from service.kitchen_karma_service import KitchenKarmaService


class InventoryService:
    def __init__(self, db):
        self.repo = InventoryRepository(db)
        self.karma_service = KitchenKarmaService(db)

    def create_item(self, data: dict) -> dict:
        schema = InventorySchema.from_request(data or {})
        doc = schema.to_document()
        result = self.repo.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    def create_items_batch(self, data) -> dict:
        if not isinstance(data, list):
            raise ValueError("Expected a list of items")

        docs = []
        for entry in data:
            schema = InventorySchema.from_request(entry or {})
            docs.append(schema.to_document())

        if not docs:
            return {"inserted_count": 0, "items": []}

        result = self.repo.insert_many(docs)
        for i, oid in enumerate(result.inserted_ids):
            docs[i]["_id"] = oid
        return {"inserted_count": len(result.inserted_ids), "items": docs}

    def list_in_fridge(self, section: str | None = None, expiry_within_days: int | None = None):
        return self.repo.find_in_fridge(section=section, expiry_within_days=expiry_within_days)

    def get_overview(self, soon_expire_within_days: float = 1.0) -> list[dict]:
        """Overview per section: total_count and soon_to_expire_count (expiry < 1 day by default)."""
        return self.repo.get_overview_per_section(soon_expire_within_days=soon_expire_within_days)

    def get_by_id(self, item_id: str):
        return self.repo.find_one(ObjectId(item_id))

    def update_item(self, item_id: str, data: dict) -> dict | None:
        oid = ObjectId(item_id)
        existing = self.repo.find_one(oid)
        if not existing:
            return None

        updates = data or {}
        karma_delta = 0

        if "qty" in updates:
            current_qty = int(existing.get("qty", 1)) or 1
            new_qty = int(updates["qty"]) if updates["qty"] is not None else current_qty
            if new_qty < current_qty:
                consumed_qty = current_qty - new_qty
                unit = existing.get("unit").strip()
                karma_delta = self.karma_service.add_karma(
                    consumed_qty, unit, DeleteReason.CONSUMED.value
                )

        self.repo.update_one(oid, updates)
        updated = self.repo.find_one(oid)
        return {"item": updated, "karma_delta": karma_delta}

    def batch_consume(self, updates: list[dict]) -> dict:
        """
        Batch consume inventory items. Used when cooking a recipe.
        Each update: {item_id, qty} = qty to consume (amount to deduct).
        Consumes min(requested_qty, current_qty). Removes item if qty reaches 0.
        Increments kitchen karma consumed. Returns total_consumed_qty.
        """
        total_consumed_qty = 0
        total_karma_delta = 0
        for entry in updates:
            item_id = entry.get("item_id")
            to_consume = int(entry.get("qty", 0) or 0)
            if item_id is None or to_consume <= 0:
                continue
            try:
                oid = ObjectId(item_id)
            except Exception:
                continue
            existing = self.repo.find_one(oid)
            if not existing:
                continue
            current_qty = int(existing.get("qty", 1)) or 1
            consumed_qty = min(to_consume, current_qty)
            if consumed_qty <= 0:
                continue
            total_consumed_qty += consumed_qty
            unit = existing.get("unit").strip()
            total_karma_delta += self.karma_service.add_karma(
                consumed_qty, unit, DeleteReason.CONSUMED.value
            )
            new_qty = current_qty - consumed_qty
            if new_qty <= 0:
                self.repo.delete_one(oid)
            else:
                self.repo.update_one(oid, {"qty": new_qty})
        return {
            "total_consumed_qty": total_consumed_qty,
            "karma_delta": total_karma_delta,
        }

    def delete_item(self, item_id: str, reason: str | None = None) -> dict | None:
        oid = ObjectId(item_id)
        existing = self.repo.find_one(oid)
        if not existing:
            return None

        if not reason:
            expiry = existing.get("expiry_date")
            now = datetime.now(timezone.utc)
            if expiry:
                exp_dt = expiry if isinstance(expiry, datetime) else datetime.fromisoformat(str(expiry).replace("Z", "+00:00"))
                if exp_dt.tzinfo is None:
                    exp_dt = exp_dt.replace(tzinfo=timezone.utc)
                reason = DeleteReason.WASTED.value if exp_dt < now else DeleteReason.CONSUMED.value
            else:
                reason = DeleteReason.CONSUMED.value

        self.repo.delete_one(oid)

        reason_norm = reason.strip().lower()
        karma_delta = 0
        if reason_norm in (DeleteReason.WASTED.value, DeleteReason.CONSUMED.value):
            qty = int(existing.get("qty", 1)) or 1
            unit = (existing.get("unit") or "pcs").strip() or "pcs"
            karma_delta = self.karma_service.add_karma(qty, unit, reason_norm)

        return {"item": existing, "reason": reason, "karma_delta": karma_delta}

