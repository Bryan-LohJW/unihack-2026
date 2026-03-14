"""
LLM service layer: parses a receipt image and returns items shaped for InventorySchema.
"""

from ai_models.receipt_scanner import parse_receipt
from ai_models.icon_image_mapping import map_items_to_icons


def parse_image_to_inventory_items(image_bytes: bytes, media_type: str = "image/jpeg") -> list[dict]:
    """
    Parse a receipt image and return a list of items suitable for InventorySchema.

    Args:
        image_bytes: Raw image file bytes.
        media_type: MIME type of the image (e.g. "image/jpeg").

    Returns:
        List of dicts with keys: name, calories, section, expiry_days, qty, image_url.
    """
    result = parse_receipt(image_bytes, media_type=media_type)

    items = []
    for item in result.get("recognised", []):
        items.append({
            "name": item.get("name", "Unknown"),
            "calories": 0,
            "section": item.get("location", "fridge"),
            "expiry_days": item.get("expiry_days", 7),
            "qty": item.get("quantity", 1),
            "image_url": None,
        })

    if items:
        icon_input = {item["name"]: None for item in items}
        icon_mapping = map_items_to_icons(icon_input)
        for item in items:
            item["image_url"] = icon_mapping.get(item["name"], "unknown.png")

    return items


def suggest_recipes_from_inventory(inventory_items: list[dict]) -> list[dict]:
    """
    Suggest recipes based on current inventory. LLM should prioritize by expiry.

    TODO: Integrate with LLM; pass inventory_items (with name, qty, expiry_date, etc.)
    and return list of RecipeSuggestion-shaped dicts.

    Args:
        inventory_items: List of inventory docs (name, qty, expiry_date, section, ...).

    Returns:
        List of dicts with keys: menu, headcount, cuisine_type, nutrition_per_person,
        ingredients (list of {name, qty}), ingredients_to_buy (list of {name, qty}).
    """
    # Hardcoded placeholder until LLM integration.
    return [
        {
            "menu": "Milk & Egg Scramble",
            "headcount": 2,
            "cuisine_type": "Western",
            "nutrition_per_person": {"calories": 250, "protein": 18, "carbs": 8, "fat": 16},
            "ingredients": [{"name": "Milk", "qty": 1}, {"name": "Eggs", "qty": 2}],
            "ingredients_to_buy": [{"name": "Butter", "qty": 1}],
        },
    ]
