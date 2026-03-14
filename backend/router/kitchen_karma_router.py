from flask import Blueprint, jsonify

from service.kitchen_karma_service import KitchenKarmaService


kitchen_karma_bp = Blueprint(
    "kitchen_karma", __name__, url_prefix="/kitchen_karma")


def init_kitchen_karma_routes(db):
    service = KitchenKarmaService(db)

    @kitchen_karma_bp.route("", methods=["GET"])
    def get_kitchen_karma():
        return jsonify(service.get_score()), 200

    return kitchen_karma_bp
