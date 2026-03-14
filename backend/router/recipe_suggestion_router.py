from flask import Blueprint, jsonify

from mongo_collection.repository.recipe_suggestion_repository import RecipeSuggestionRepository


recipe_suggestion_bp = Blueprint(
    "recipe_suggestions", __name__, url_prefix="/recipe-suggestions"
)


def init_recipe_suggestion_routes(db):
    recipe_suggestion_repo = RecipeSuggestionRepository(db)

    @recipe_suggestion_bp.route("/<suggestion_id>", methods=["GET"])
    def get_suggestion_by_id(suggestion_id):
        """
        Return all recipe suggestions for a given suggestion_id.
        """
        batch_docs = recipe_suggestion_repo.find_by_suggestion_id(suggestion_id)
        if not batch_docs:
            return jsonify({"suggestion": None}), 404

        d0 = batch_docs[0]
        suggestion = {
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
        return jsonify({"suggestion": suggestion}), 200

    return recipe_suggestion_bp
