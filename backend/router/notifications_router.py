from flask import Blueprint, jsonify, request

from mongo_collection.repository.recipe_suggestion_repository import RecipeSuggestionRepository


notifications_bp = Blueprint("notifications", __name__, url_prefix="/notifications")


def init_notifications_routes(db):
    recipe_suggestion_repo = RecipeSuggestionRepository(db)

    @notifications_bp.route("/latest", methods=["GET"])
    def get_latest_notifications():
        """
        Return latest notifications for frontend polling.
        Currently includes recipe suggestions; more types can be added later.
        """
        limit = min(int(request.args.get("limit", 20)), 50)
        suggestions = recipe_suggestion_repo.find_recent(limit=limit)

        notifications = [
            {
                "id": str(d["_id"]),
                "type": "recipe_suggestion",
                "created_at": d["created_at"].isoformat() if hasattr(d.get("created_at"), "isoformat") else d.get("created_at"),
                "data": {
                    "menu": d.get("menu"),
                    "headcount": d.get("headcount"),
                    "cuisine_type": d.get("cuisine_type"),
                    "nutrition_per_person": d.get("nutrition_per_person"),
                    "ingredients": d.get("ingredients"),
                    "ingredients_to_buy": d.get("ingredients_to_buy"),
                },
            }
            for d in suggestions
        ]

        return jsonify({
            "notifications": notifications,
            "count": len(notifications),
        }), 200

    return notifications_bp
