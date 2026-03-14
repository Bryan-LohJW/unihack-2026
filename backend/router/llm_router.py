from flask import Blueprint, request, jsonify

from mongo_collection.schema.recipe_suggestion_schema import RecipeSuggestionSchema
from service.llm_client import parse_image_to_inventory_items


llm_bp = Blueprint("llm", __name__, url_prefix="/llm")


def init_llm_routes(db):

    @llm_bp.route("/receipt", methods=["POST"])
    def scan_receipt():
        if "file" not in request.files:
            return jsonify({"error": "No image provided. Use form key 'file'."}), 400

        file = request.files.get("file")
        if not file or file.filename == "":
            return jsonify({"error": "No image selected."}), 400

        media_type = file.mimetype or "image/jpeg"
        image_bytes = file.read()

        try:
            items = parse_image_to_inventory_items(image_bytes, media_type=media_type)
        except Exception as e:
            return jsonify({"error": "Failed to process receipt.", "detail": str(e)}), 502

        return jsonify(items), 200
