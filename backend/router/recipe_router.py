from util.util import reponse_serializer
from flask import Blueprint, jsonify, request

from service.recipe_service import RecipeService


recipe_bp = Blueprint("recipes", __name__, url_prefix="/recipes")


def init_recipe_routes(db):
    service = RecipeService(db)

    @recipe_bp.route("", methods=["POST"])
    def create_recipe():
        data = request.json
        doc = service.create_recipe(data)
        doc["_id"] = str(doc["_id"])
        return jsonify(doc), 201

    @recipe_bp.route("", methods=["GET"])
    def list_recipes():
        recipes = service.list_recipes()
        for r in recipes:
            r["_id"] = str(r["_id"])
        return jsonify(recipes), 200

    @recipe_bp.route("/<recipe_id>", methods=["GET"])
    def get_recipe(recipe_id):
        recipe = service.get_recipe(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404
        recipe["_id"] = str(recipe["_id"])
        return jsonify(recipe), 200

    @recipe_bp.route("/<recipe_id>", methods=["DELETE"])
    def delete_recipe(recipe_id):
        deleted = service.delete_recipe(recipe_id)
        if not deleted:
            return jsonify({"message": "not found"}), 404
        return jsonify({"message": "deleted"}), 200

    return recipe_bp
