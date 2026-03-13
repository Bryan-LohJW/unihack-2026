from flask import Blueprint, jsonify


health_bp = Blueprint("health", __name__)


def init_health_routes(client):
    @health_bp.route("/health", methods=["GET"])
    def health_check():
        try:
            client.admin.command("ping")
            return (
                jsonify(
                    {
                        "status": "online",
                        "database": "connected",
                        "environment": "development",
                    }
                ),
                200,
            )
        except Exception as e:
            return (
                jsonify(
                    {
                        "status": "offline",
                        "database": "disconnected",
                        "error": str(e),
                    }
                ),
                500,
            )

    return health_bp

