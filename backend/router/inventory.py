from flask import Blueprint, request, jsonify
from bson import ObjectId
from mongo_collection.schema.inventory import InventorySchema
from mongo_collection.repository.inventory_repository import InventoryRepository
from util.util import reponse_serializer


inventory_bp = Blueprint("inventory", __name__, url_prefix="/inventory")


def init_inventory_routes(db):
    repo = InventoryRepository(db)

    @inventory_bp.route("/batch", methods=["POST"])
    def add_items_batch():
        data = request.json
        if not isinstance(data, list):
            return jsonify({"error": "Expected a list of items"}), 400

        items_to_insert = []
        for entry in data:
            schema = InventorySchema.from_request(entry)
            items_to_insert.append(schema.to_document())

        if items_to_insert:
            result = repo.insert_many(items_to_insert)
            return jsonify({"inserted_count": len(result.inserted_ids)}), 201

        return jsonify({"inserted_count": 0}), 200

    @inventory_bp.route("", methods=["POST"])
    def add_item():
        data = request.json
        schema = InventorySchema.from_request(data)
        doc = schema.to_document()
        result = repo.insert_one(doc)
        doc["_id"] = result.inserted_id
        return jsonify(reponse_serializer(doc)), 201

    @inventory_bp.route("", methods=["GET"])
    def get_inventory():
        items = repo.find_in_fridge()
        return jsonify([reponse_serializer(item) for item in items]), 200

    @inventory_bp.route("/<item_id>", methods=["PUT"])
    def update_item(item_id):
        data = request.json
        repo.update_one(ObjectId(item_id), data)
        updated = repo.find_one(ObjectId(item_id))
        if not updated:
            return jsonify({"message": "not found"}), 404
        return jsonify(reponse_serializer(updated)), 200

    @inventory_bp.route("/<item_id>", methods=["DELETE"])
    def delete_item(item_id):
        repo.delete_one(ObjectId(item_id))
        return jsonify({"message": "deleted"}), 200

    @inventory_bp.route("/<item_id>", methods=["GET"])
    def get_item(item_id):
        item = repo.find_one(ObjectId(item_id))
        if not item:
            return jsonify({"error": "Item not found"}), 404

        return jsonify(reponse_serializer(item)), 200

    return inventory_bp

