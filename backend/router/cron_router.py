from flask import Blueprint, jsonify

from mongo_collection.repository.recipe_suggestion_repository import RecipeSuggestionRepository
from service.recipe_suggestion_service import RecipeSuggestionService


cron_bp = Blueprint("cron", __name__, url_prefix="/cron")


def _serialize_suggestion(doc):
    out = dict(doc)
    if "_id" in out:
        out["_id"] = str(out["_id"])
    if "created_at" in out and hasattr(out["created_at"], "isoformat"):
        out["created_at"] = out["created_at"].isoformat()
    return out


def init_cron_routes(db):
    recipe_suggestion_service = RecipeSuggestionService(db)

    @cron_bp.route("/recipe-suggestions", methods=["POST"])
    def trigger_recipe_suggestions():
        """
        Manually trigger the recipe-suggestions job (same logic as the background cron).
        Creates recipe_suggestions from current inventory via LLM. Use for testing or on-demand run.
        """
        suggestions = recipe_suggestion_service.run_cron_suggestions()
        return jsonify({
            "triggered": True,
            "count": len(suggestions),
            "suggestions": suggestions,
        }), 200


    return cron_bp
