from flask import Blueprint, jsonify

from mongo_collection.schema.inventory_schema import InventorySchema

helper_bp = Blueprint("helper", __name__, url_prefix="/helper")

SEED_ITEMS = [
    # Fridge — varied expiry
    {"name": "Chicken Breast",    "calories": 165, "section": "fridge",   "expiry_days": -1,   "qty": 500,  "unit": "g",   "image_url": "chicken.png"},
    {"name": "Full Cream Milk",   "calories": 61,  "section": "fridge",   "expiry_days": 4,   "qty": 2,    "unit": "l",   "image_url": "milk.png"},
    {"name": "Barn Eggs",         "calories": 155, "section": "fridge",   "expiry_days": 14,  "qty": 12,   "unit": "pcs", "image_url": "eggs.png"},
    {"name": "Cheddar Cheese",    "calories": 402, "section": "fridge",   "expiry_days": 10,  "qty": 200,  "unit": "g",   "image_url": "cheese.png"},
    {"name": "Greek Yoghurt",     "calories": 59,  "section": "fridge",   "expiry_days": 5,   "qty": 400,  "unit": "g",   "image_url": "yoghurt.png"},
    {"name": "Butter",            "calories": 717, "section": "fridge",   "expiry_days": 30,  "qty": 250,  "unit": "g",   "image_url": "butter.png"},
    {"name": "Tomato",            "calories": 18,  "section": "fridge",   "expiry_days": 3,   "qty": 6,    "unit": "pcs", "image_url": "tomato.png"},
    {"name": "Capsicum",          "calories": 31,  "section": "fridge",   "expiry_days": 6,   "qty": 3,    "unit": "pcs", "image_url": "capsicum.png"},
    {"name": "Sliced Mushrooms",  "calories": 22,  "section": "fridge",   "expiry_days": 4,   "qty": 200,  "unit": "g",   "image_url": "mushroom.png"},
    {"name": "Carrot",            "calories": 41,  "section": "fridge",   "expiry_days": 14,  "qty": 4,    "unit": "pcs", "image_url": "carrot.png"},
    {"name": "Strawberries",      "calories": 32,  "section": "fridge",   "expiry_days": 2,   "qty": 250,  "unit": "g",   "image_url": "strawberry.png"},
    {"name": "Lemon",             "calories": 29,  "section": "fridge",   "expiry_days": 21,  "qty": 3,    "unit": "pcs", "image_url": "lemon.png"},
    {"name": "Tofu",              "calories": 76,  "section": "fridge",   "expiry_days": 21,  "qty": 3,    "unit": "pcs", "image_url": "unknown.png"},
    {"name": "Shrimp",            "calories": 99,  "section": "fridge",   "expiry_days": 2,   "qty": 300,  "unit": "g",   "image_url": "shrimp.png"},

    # Freezer
    {"name": "Beef Mince",        "calories": 250, "section": "freezer",  "expiry_days": 60,  "qty": 500,  "unit": "g",   "image_url": "beef_mince.png"},
    {"name": "Fish Fillet",       "calories": 92,  "section": "freezer",  "expiry_days": 90,  "qty": 400,  "unit": "g",   "image_url": "fish.png"},
    {"name": "Ice Cream",         "calories": 207, "section": "freezer",  "expiry_days": 60,  "qty": 1,    "unit": "l",   "image_url": "ice_cream.png"},
    {"name": "Frozen Peas",       "calories": 81,  "section": "freezer",  "expiry_days": 120, "qty": 500,  "unit": "g",   "image_url": "frozen_bag.png"},
    {"name": "Red Meat Steak",    "calories": 271, "section": "freezer",  "expiry_days": 90,  "qty": 400,  "unit": "g",   "image_url": "red_meat.png"},

    # Pantry — produce & staples
    {"name": "Basmati Rice",      "calories": 365, "section": "pantry",   "expiry_days": 365, "qty": 1,    "unit": "kg",  "image_url": "rice.png"},
    {"name": "Spaghetti",         "calories": 371, "section": "pantry",   "expiry_days": 730, "qty": 500,  "unit": "g",   "image_url": "noodles.png"},
    {"name": "Rolled Oats",       "calories": 389, "section": "pantry",   "expiry_days": 180, "qty": 1,    "unit": "kg",  "image_url": "oats.png"},
    {"name": "Plain Flour",       "calories": 364, "section": "pantry",   "expiry_days": 365, "qty": 1,    "unit": "kg",  "image_url": "flour.png"},
    {"name": "Olive Oil",         "calories": 884, "section": "pantry",   "expiry_days": 365, "qty": 500,  "unit": "ml",  "image_url": "oil.png"},
    {"name": "Tomato Sauce",      "calories": 74,  "section": "pantry",   "expiry_days": 180, "qty": 700,  "unit": "ml",  "image_url": "tomato_sauce.png"},
    {"name": "Soy Sauce",         "calories": 53,  "section": "pantry",   "expiry_days": 365, "qty": 250,  "unit": "ml",  "image_url": "sauce.png"},
    {"name": "Brown Onion",       "calories": 40,  "section": "pantry",   "expiry_days": 30,  "qty": 4,    "unit": "pcs", "image_url": "onion.png"},
    {"name": "Garlic",            "calories": 149, "section": "pantry",   "expiry_days": 21,  "qty": 2,    "unit": "pcs", "image_url": "garlic.png"},
    {"name": "Potato",            "calories": 77,  "section": "pantry",   "expiry_days": 21,  "qty": 1,    "unit": "kg",  "image_url": "potato.png"},
    {"name": "Apple",             "calories": 52,  "section": "pantry",   "expiry_days": 14,  "qty": 5,    "unit": "pcs", "image_url": "apple.png"},
    {"name": "Banana",            "calories": 89,  "section": "pantry",   "expiry_days": 5,   "qty": 6,    "unit": "pcs", "image_url": "banana.png"},
    {"name": "Canned Tuna",       "calories": 116, "section": "pantry",   "expiry_days": 730, "qty": 3,    "unit": "can", "image_url": "can_food.png"},
    {"name": "Orange",            "calories": 47,  "section": "pantry",   "expiry_days": 14,  "qty": 4,    "unit": "pcs", "image_url": "orange.png"},

    # Pantry — seasonings & condiments (using unknown.png as no dedicated icon)
    {"name": "Salt",              "calories": 0,   "section": "pantry",   "expiry_days": 1825,"qty": 500,  "unit": "g",   "image_url": "unknown.png"},
    {"name": "Black Pepper",      "calories": 251, "section": "pantry",   "expiry_days": 1095,"qty": 50,   "unit": "g",   "image_url": "unknown.png"},
    {"name": "Paprika",           "calories": 282, "section": "pantry",   "expiry_days": 730, "qty": 50,   "unit": "g",   "image_url": "unknown.png"},
    {"name": "Cumin",             "calories": 375, "section": "pantry",   "expiry_days": 730, "qty": 40,   "unit": "g",   "image_url": "unknown.png"},
    {"name": "Dried Oregano",     "calories": 265, "section": "pantry",   "expiry_days": 730, "qty": 30,   "unit": "g",   "image_url": "unknown.png"},
    {"name": "Chilli Flakes",     "calories": 282, "section": "pantry",   "expiry_days": 730, "qty": 30,   "unit": "g",   "image_url": "unknown.png"},
    {"name": "Turmeric",          "calories": 312, "section": "pantry",   "expiry_days": 730, "qty": 40,   "unit": "g",   "image_url": "unknown.png"},
    {"name": "Garlic Powder",     "calories": 331, "section": "pantry",   "expiry_days": 730, "qty": 50,   "unit": "g",   "image_url": "unknown.png"},
]


def init_helper_routes(db):
    inventory_col = db["inventory"]
    kitchen_karma = db["kitchen_karma"]

    @helper_bp.route("/reset/ingredients", methods=["GET"])
    def reset_ingredients():
        inventory_col.delete_many({})
        kitchen_karma.delete_many({})

        docs = [InventorySchema(**item).to_document() for item in SEED_ITEMS]
        inventory_col.insert_many(docs)

        return jsonify({"message": f"Inventory reset with {len(docs)} items."}), 200
