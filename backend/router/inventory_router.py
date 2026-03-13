from flask import Blueprint, request, jsonify

from util.util import reponse_serializer
from mongo_collection.service.inventory_service import InventoryService


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

    @inventory_bp.route("", methods=["GET"])
    def get_inventory():
        items = service.list_in_fridge()
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
        service.delete_item(item_id)
        return jsonify({"message": "deleted"}), 200

    @inventory_bp.route("/<item_id>", methods=["GET"])
    def get_item(item_id):
        item = service.get_by_id(item_id)
        if not item:
            return jsonify({"error": "Item not found"}), 404

        return jsonify(reponse_serializer(item)), 200

    return inventory_bp

