from flask import Blueprint, request, jsonify

from constant.enum import DeleteReason
from service.inventory_service import InventoryService
from util.util import reponse_serializer


inventory_bp = Blueprint("inventory", __name__, url_prefix="/inventory")


def init_inventory_routes(db):
    service = InventoryService(db)

    @inventory_bp.route("/batch", methods=["POST"])
    def add_items_batch():
        data = request.json
        try:
            payload = service.create_items_batch(data)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
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

    return inventory_bp

