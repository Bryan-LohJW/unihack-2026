from flask import Blueprint, jsonify

from mongo_collection.repository.recipe_suggestion_repository import RecipeSuggestionRepository


cron_bp = Blueprint("cron", __name__, url_prefix="/cron")


def _serialize_suggestion(doc):
    out = dict(doc)
    if "_id" in out:
        out["_id"] = str(out["_id"])
    if "created_at" in out and hasattr(out["created_at"], "isoformat"):
        out["created_at"] = out["created_at"].isoformat()
    return out


def init_cron_routes(db):
    recipe_suggestion_repo = RecipeSuggestionRepository(db)

    @cron_bp.route("/recipe-suggestions", methods=["GET"])
    def get_recent_recipe_suggestions():
        """Return recent stored suggestions (for web app notifications)."""
        limit = 50
        docs = recipe_suggestion_repo.find_recent(limit=limit)
        return jsonify({"suggestions": [_serialize_suggestion(d) for d in docs]}), 200

    return cron_bp
