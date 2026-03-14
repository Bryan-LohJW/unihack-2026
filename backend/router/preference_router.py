from flask import Blueprint, request, jsonify

from service.preference_service import PreferenceService


preference_bp = Blueprint("preference", __name__, url_prefix="/preference")


def init_preference_routes(db):
    service = PreferenceService(db)

    @preference_bp.route("", methods=["GET"])
    def get_preference():
        """Get the current user preferences (returns defaults if none stored)."""
        prefs = service.get_preference()
        return jsonify(prefs), 200

    @preference_bp.route("", methods=["PUT"])
    def update_preference():
        """
        Update user preferences.
        Body: { default_serving?, cuisine?, dietary?, default_serving? }
        """
        data = request.get_json(silent=True) or {}
        updated = service.update_preference(data)
        return jsonify(updated), 200


    return preference_bp
