from flask import Blueprint, request, jsonify

from service.llm_client import parse_image_to_inventory_items
from service.inventory_service import InventoryService
from util.util import reponse_serializer


llm_bp = Blueprint("llm", __name__, url_prefix="/llm")


def init_llm_routes(db):
    inventory_service = InventoryService(db)

    @llm_bp.route("/receipt", methods=["POST"])
    def parse_image_and_create_inventory():
        """
        Accept an image upload, parse it for items via LLM (placeholder),
        map to inventory schema and create inventory items.
        """
        if "image" not in request.files and "file" not in request.files:
            return jsonify({"error": "No image provided. Use form key 'image' or 'file'."}), 400

        file = request.files.get("file")
        if not file or file.filename == "":
            return jsonify({"error": "No image selected."}), 400

        image_bytes = file.read()
        filename = file.filename

        items_payload = parse_image_to_inventory_items(
            image_bytes, filename=filename)
        if not items_payload:
            return jsonify({"inserted_count": 0, "items": []}), 201

        result = inventory_service.create_items_batch(items_payload)
        inserted_count = result.get("inserted_count", 0)
        created_docs = result.get("items", [])

        return jsonify({
            "inserted_count": inserted_count,
            "items": [reponse_serializer(doc) for doc in created_docs],
        }), 201
