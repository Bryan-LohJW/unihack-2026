from flask import Blueprint, request, jsonify

from ai_models.receipt_scanner import parse_receipt


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
            result = parse_receipt(image_bytes, media_type=media_type)
        except Exception as e:
            return jsonify({"error": "Failed to process receipt.", "detail": str(e)}), 502

        return jsonify(result), 200
