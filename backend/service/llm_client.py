"""
LLM integration placeholder.

Replace parse_image_to_inventory_items() with real LLM/vision API call
that analyzes the uploaded image and returns items in inventory-schema shape.
"""


def parse_image_to_inventory_items(image_bytes: bytes, filename: str | None = None) -> list[dict]:
    """
    Parse an image and return a list of items suitable for InventorySchema.

    TODO: Integrate with LLM/vision API to extract:
    - item names, qty, section, estimated expiry_days, calories, nutrition.

    Args:
        image_bytes: Raw image file bytes.
        filename: Original filename (optional, for logging or API).

    Returns:
        List of dicts with keys: name, calories, section, expiry_days,
        nutrition (optional), qty (optional), image_url (optional).
    """
    # Hardcoded response until LLM integration is implemented.
    return [
        {
            "name": "Milk",
            "calories": 42,
            "section": "fridge",
            "expiry_days": 7,
            "nutrition": {"protein": 3, "carbs": 5, "fat": 1},
            "qty": 1,
            "image_url": None,
        },
        {
            "name": "Eggs",
            "calories": 155,
            "section": "fridge",
            "expiry_days": 21,
            "nutrition": {"protein": 13, "carbs": 1, "fat": 11},
            "qty": 1,
            "image_url": None,
        },
    ]
