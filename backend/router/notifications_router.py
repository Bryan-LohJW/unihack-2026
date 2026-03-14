from flask import Blueprint, jsonify, request

from mongo_collection.repository.recipe_suggestion_repository import RecipeSuggestionRepository


notifications_bp = Blueprint("notifications", __name__, url_prefix="/notifications")


def _serialize_suggestion_batch(batch_docs):
    if not batch_docs:
        return None
    d0 = batch_docs[0]
    return {
        "suggestion_id": d0.get("suggestion_id"),
        "created_at": (
            d0.get("created_at").isoformat()
            if hasattr(d0.get("created_at"), "isoformat")
            else d0.get("created_at")
        ),
        "recipes": [
            {
                "id": str(d["_id"]),
                "menu": d.get("menu"),
                "headcount": d.get("headcount"),
                "cuisine_type": d.get("cuisine_type"),
                "nutrition_per_person": d.get("nutrition_per_person"),
                "ingredients": d.get("ingredients"),
                "ingredients_to_buy": d.get("ingredients_to_buy"),
            }
            for d in batch_docs
        ],
    }


def init_notifications_routes(db):
    recipe_suggestion_repo = RecipeSuggestionRepository(db)

    @notifications_bp.route("/latest", methods=["GET"])
    def get_latest_notifications():
        """
        Return the latest batch of recipe suggestions for frontend polling.
        Only the most recent batch (identified by suggestion_id) is returned.
        """
        limit = min(int(request.args.get("limit", 50)), 100)
        docs = recipe_suggestion_repo.find_recent(limit=limit)
        if not docs:
            return jsonify({"suggestion": None}), 200

        latest_suggestion_id = docs[0].get("suggestion_id")
        batch_docs = [d for d in docs if d.get("suggestion_id") == latest_suggestion_id]
        suggestion = _serialize_suggestion_batch(batch_docs)
        return jsonify({"suggestion": suggestion}), 200

    return notifications_bp
