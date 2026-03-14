from flask import Blueprint, jsonify, request

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

        data = request.get_json(force=True, silent=True) or {}
        cuisine = data.get("cuisine") or []
        if not isinstance(cuisine, list):
            cuisine = [str(cuisine)] if cuisine else []
        dietary_requirements = data.get("dietary_requirements", data.get("dietary")) or []
        if not isinstance(dietary_requirements, list):
            dietary_requirements = [str(dietary_requirements)] if dietary_requirements else []
        headcount = max(1, int(data.get("headcount", data.get("quantity", data.get("defaultServings", 1))) or 1))

        payload, status = recipe_suggestion_service.run_cron_suggestions(
            cuisine, dietary_requirements, headcount)

        return jsonify(payload), status


    return cron_bp
