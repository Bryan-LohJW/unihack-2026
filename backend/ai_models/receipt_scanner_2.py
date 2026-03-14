import json
import re
from datetime import date

from google.genai import types

from ai_models.gemini_client import get_gemini_client

from ai_models.icon_image_mapping import map_items_to_icons




def _expiry_date_to_days(expiry_date_str: str, default: int = 7) -> int:
    if not expiry_date_str:
        return default
    try:
        return max(1, (date.fromisoformat(expiry_date_str) - date.today()).days)
    except ValueError:
        return default


SYSTEM_PROMPT = """You are a grocery receipt parser for a kitchen inventory app.

You will be given an image of a grocery receipt. Your job is to extract all food items from the receipt and return structured data.

For each food item found, return:
- name: the full, readable ingredient name (not abbreviated — e.g. "Chicken Breast" not "CHKN BRSTLS")
- quantity: numeric quantity purchased (e.g. 2)
- unit: one of [g, kg, ml, l, pcs, pack, bottle, box, bag, can, carton, bunch, other]
- expiry_date: calculated as today + expiry_days (today is {today_date})
- section: default storage section, generate based on the type of item (e.g. "fridge", "freezer", "pantry")
- confidence: "high" if you are confident this is a clearly identifiable food item, "low" if the name is ambiguous or unclear

Non-food items (e.g. cleaning products, toiletries, bags) must be excluded entirely.

Any item you cannot confidently parse as a named food ingredient must be placed in the unrecognised list with its raw receipt text.

Return only valid JSON with no explanation, no markdown, and no code fences. Use this exact structure:
{{"recognised": [{{"name": "", "quantity": 0, "unit": "", "expiry_date": "", "section": "", "confidence": "high"}}], "unrecognised": [{{"raw_text": ""}}]}}"""


def parse_receipt_v2(image_bytes: bytes, media_type: str = "image/jpeg") -> dict:
    today_date = date.today().isoformat()
    prompt = SYSTEM_PROMPT.format(today_date=today_date)

    model = get_gemini_client("gemini-3-flash-preview")
    response = model.generate_content([
        types.Part.from_bytes(data=image_bytes, mime_type=media_type),
        prompt,
    ])

    text = response.text.strip()
    # Strip markdown code fences if Gemini wraps the response
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    result = json.loads(text)

    result.setdefault("recognised", [])
    result.setdefault("unrecognised", [])

    return result


def parse_image_to_inventory_items(image_bytes: bytes, media_type: str = "image/jpeg") -> list[dict]:
    """
    Parse a receipt image and return a list of items suitable for InventorySchema.

    Args:
        image_bytes: Raw image file bytes.
        media_type: MIME type of the image (e.g. "image/jpeg").

    Returns:
        List of dicts with keys: name, calories, section, expiry_days, qty, image_url.
    """
    result = parse_receipt_v2(image_bytes, media_type=media_type)

    items = []
    for item in result.get("recognised", []):
        items.append({
            "name": item.get("name", "Unknown"),
            "calories": 0,
            "section": item.get("section", "fridge"),
            "expiry_days": _expiry_date_to_days(item.get("expiry_date", "")),
            "qty": item.get("quantity", 1),
            "image_url": None,
        })

    if items:
        icon_input = {item["name"]: None for item in items}
        icon_mapping = map_items_to_icons(icon_input)
        for item in items:
            item["image_url"] = icon_mapping.get(item["name"], "unknown.png")

    return items