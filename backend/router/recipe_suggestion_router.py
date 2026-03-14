from flask import Blueprint, jsonify, request

from mongo_collection.repository.recipe_suggestion_repository import RecipeSuggestionRepository
from mongo_collection.schema.recipe_suggestion_schema import RecipeSuggestionSchema


recipe_suggestion_bp = Blueprint(
    "recipe_suggestions", __name__, url_prefix="/recipe-suggestions"
)


def init_recipe_suggestion_routes(db):
    recipe_suggestion_repo = RecipeSuggestionRepository(db)

    @recipe_suggestion_bp.route("", methods=["GET"])
    def list_recipe_suggestions():
        """
        Return a list of recipe suggestions, grouped by suggestion_id (most recent first).
        Optional query: limit (default 20).
        """
        try:
            limit = min(50, max(1, int(request.args.get("limit", 20))))
        except (ValueError, TypeError):
            limit = 20
        docs = recipe_suggestion_repo.find_recent(limit=limit * 10)
        groups = {}
        for d in docs:
            sid = d.get("suggestion_id")
            if sid not in groups:
                groups[sid] = []
            groups[sid].append(d)
        suggestions = []
        for sid, batch in list(groups.items())[:limit]:
            batch.sort(key=lambda x: x.get("created_at") or "", reverse=True)
            d0 = batch[0]
            suggestions.append({
                "suggestion_id": sid,
                "created_at": (
                    d0.get("created_at").isoformat()
                    if hasattr(d0.get("created_at"), "isoformat")
                    else d0.get("created_at")
                ),
                "recipes": [RecipeSuggestionSchema.doc_to_api_recipe(d) for d in batch],
            })
        suggestions.sort(key=lambda s: s.get("created_at") or "", reverse=True)
        return jsonify({"suggestions": suggestions}), 200

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
            "recipes": [RecipeSuggestionSchema.doc_to_api_recipe(d) for d in batch_docs],
        }
        return jsonify({"suggestion": suggestion}), 200

    return recipe_suggestion_bp
