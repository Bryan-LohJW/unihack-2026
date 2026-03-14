from flask import Blueprint, jsonify, request

from db import mongo
from ai_models.generate_recipe import generate_recipe

recipe_bp_2 = Blueprint("recipe_2", __name__, url_prefix="/recipe2")


@recipe_bp_2.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(force=True)
    cuisine: list[str] = data.get("cuisine", [])
    dietary_requirements: list[str] = data.get("dietary_requirements", [])
    quantity: int = data.get("quantity", 1)

    inventory_items = list(mongo.db.inventory.find(
        {},
        {"_id": 1, "name": 1, "expiry_date": 1, "qty": 1, "unit": 1},
    ))

    if not inventory_items:
        return jsonify({"error": "No inventory items found"}), 404

    result = generate_recipe(
        inventory_items=inventory_items,
        cuisine=cuisine,
        dietary_requirements=dietary_requirements,
        quantity=quantity,
    )

    return jsonify(result), 200
