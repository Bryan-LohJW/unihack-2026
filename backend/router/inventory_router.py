from datetime import datetime, timezone

from flask import Blueprint, request, jsonify

from constant.enum import DeleteReason
from service.inventory_service import InventoryService
from util.logger import log_event
from util.util import reponse_serializer


inventory_bp = Blueprint("inventory", __name__, url_prefix="/inventory")


def init_inventory_routes(db):
    service = InventoryService(db)

    @inventory_bp.route("/batch", methods=["PATCH"])
    def batch_consume():
        """
        Batch consume inventory. Body: {updates: [{item_id, qty}, ...]}.
        qty = amount to consume (deduct). Consumes min(qty, current_qty).
        Response: {total_consumed_qty, karma_delta} — karma_delta is unit-aware (per karma_rules).
        """
        data = request.json or {}
        updates = data.get("updates", [])
        if not isinstance(updates, list):
            return jsonify({"error": "updates must be a list of {item_id, qty}"}), 400
        result = service.batch_consume(updates)
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
        overview = service.get_overview(soon_expire_within_days=3.0)
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
        result = service.update_item(item_id, data)
        if not result:
            return jsonify({"message": "not found"}), 404
        payload = reponse_serializer(result["item"])
        payload["karma_delta"] = result["karma_delta"]
        return jsonify(payload), 200

    @inventory_bp.route("/<item_id>", methods=["DELETE"])
    def delete_item(item_id):
        reason_str = request.args.get("reason", None)
        result = service.delete_item(item_id, reason=reason_str)
        if not result:
            return jsonify({"message": "not found"}), 404
        return jsonify({
            "message": "deleted",
            "reason": result["reason"],
            "karma_delta": result["karma_delta"],
        }), 200

    @inventory_bp.route("/<item_id>", methods=["GET"])
    def get_item(item_id):
        item = service.get_by_id(item_id)
        if not item:
            return jsonify({"error": "Item not found"}), 404

        return jsonify(reponse_serializer(item)), 200

    return inventory_bp

