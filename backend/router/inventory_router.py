from datetime import datetime, timezone

from flask import Blueprint, request, jsonify

from constant.enum import DeleteReason
from service.inventory_service import InventoryService
from service.llm_client import infer_expiry_single
from util.logger import log_event
from util.util import reponse_serializer


inventory_bp = Blueprint("inventory", __name__, url_prefix="/inventory")


def init_inventory_routes(db):
    service = InventoryService(db)

    @inventory_bp.route("/batch", methods=["PATCH"])
    def batch_update_qty():
        data = request.json or {}
        updates = data.get("updates", [])
        if not isinstance(updates, list):
            return jsonify({"error": "updates must be a list of {item_id, qty}"}), 400
        result = service.batch_update_qty(updates)
        result["updated"] = [reponse_serializer(
            item) for item in result["updated"]]
        result["deleted"] = [reponse_serializer(
            item) for item in result["deleted"]]

        return jsonify(result), 200

    @inventory_bp.route("/batch", methods=["POST"])
    def add_items_batch():
        data = request.json
        try:
            payload = service.create_items_batch(data)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        if "items" in payload:
            payload = {**payload, "items": [reponse_serializer(item) for item in payload["items"]]}
        status = 201 if payload.get("inserted_count", 0) > 0 else 200
        return jsonify(payload), status

    @inventory_bp.route("", methods=["POST"])
    def add_item():
        data = request.json
        doc = service.create_item(data)
        return jsonify(reponse_serializer(doc)), 201

    @inventory_bp.route("/overview", methods=["GET"])
    def get_overview():
        overview = service.get_overview(soon_expire_within_days=1.0)
        return jsonify({"sections": overview}), 200

    @inventory_bp.route("", methods=["GET"])
    def get_inventory():
        section = request.args.get("section")
        expiry_within_days = request.args.get("expiry_within_days", type=int)
        items = service.list_in_fridge(section=section, expiry_within_days=expiry_within_days)
        return jsonify([reponse_serializer(item) for item in items]), 200

    @inventory_bp.route("/<item_id>", methods=["PUT"])
    def update_item(item_id):
        data = request.json
        updated = service.update_item(item_id, data)
        if not updated:
            return jsonify({"message": "not found"}), 404
        return jsonify(reponse_serializer(updated)), 200

    @inventory_bp.route("/<item_id>", methods=["DELETE"])
    def delete_item(item_id):
        reason_str = request.args.get("reason", DeleteReason.CONSUMED.value)
        deleted = service.delete_item(item_id, reason=reason_str)
        if not deleted:
            return jsonify({"message": "not found"}), 404
        return jsonify({"message": "deleted", "reason": reason_str}), 200

    @inventory_bp.route("/<item_id>", methods=["GET"])
    def get_item(item_id):
        item = service.get_by_id(item_id)
        if not item:
            return jsonify({"error": "Item not found"}), 404

        return jsonify(reponse_serializer(item)), 200

    @inventory_bp.route("/add", methods=["POST"])
    def add_item_with_expiry():
        """PRD §12 — POST /inventory/add with LLM expiry inference."""
        data = request.get_json(force=True)
        user_id = data.get("user_id", "")
        item_name = data.get("item")
        qty = data.get("qty", 1)
        unit = data.get("unit", "pieces")

        if not item_name:
            return jsonify({"error": "item is required"}), 400

        now = datetime.now(timezone.utc)
        added_at = now.isoformat()

        # Infer expiry via Gemini Flash
        expiry_info = infer_expiry_single(item_name, added_at)
        method = "llm"
        expiry_days = expiry_info.get("expiry_days", 7)
        expiry_date_str = expiry_info.get("expiry_date")
        try:
            expiry_date = datetime.fromisoformat(expiry_date_str)
            if expiry_date.tzinfo is None:
                expiry_date = expiry_date.replace(tzinfo=timezone.utc)
        except Exception:
            from datetime import timedelta
            expiry_date = now + timedelta(days=expiry_days)
            method = "fallback"

        doc_data = {
            "name": item_name,
            "calories": 0,
            "section": "fridge",
            "expiry_days": expiry_days,
            "qty": qty,
            "image_url": None,
            "user_id": user_id,
            "unit": unit,
        }
        doc = service.create_item(doc_data)

        # Update the doc with the inferred expiry_date
        from bson import ObjectId
        service.update_item(str(doc["_id"]), {
            "expiry_date": expiry_date,
            "expiry_days": expiry_days,
        })
        doc["expiry_date"] = expiry_date
        doc["expiry_days"] = expiry_days

        log_event(
            event_type="expiry_inferred",
            user_id=user_id,
            session_id="",
            payload={
                "item_name": item_name,
                "inferred_expiry_date": expiry_date.isoformat(),
                "method": method,
            },
        )

        return jsonify(reponse_serializer(doc)), 201

    return inventory_bp

