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
