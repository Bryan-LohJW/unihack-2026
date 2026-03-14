import base64
import json
import re
from datetime import date

from ai_models.gemini_client import get_gemini_client

SYSTEM_PROMPT = """You are a grocery receipt parser for a kitchen inventory app.

You will be given an image of a grocery receipt. Your job is to extract all food items from the receipt and return structured data.

For each food item found, return:
- name: the full, readable ingredient name (not abbreviated — e.g. "Chicken Breast" not "CHKN BRSTLS")
- category: one of [meat, seafood, dairy, produce, deli, dry_goods, frozen, beverages, condiments, other]
- quantity: numeric quantity purchased (e.g. 2)
- unit: one of [g, kg, ml, l, pcs, pack, bottle, box, bag, can, carton, bunch, other]
- expiry_days: estimated number of days from purchase before this item expires, based on its category using these guidelines:
    - meat: 3 days
    - seafood: 2 days
    - dairy: 7 days
    - produce: 7 days
    - deli: 5 days
    - dry_goods: 730 days
    - frozen: 180 days
    - beverages: 14 days
    - condiments: 180 days
    - other: 14 days
- expiry_date: calculated as today + expiry_days (today is {today_date})
- location: default storage location, one of [fridge, pantry, freezer], assigned based on category:
    - fridge: meat, seafood, dairy, produce, deli, beverages
    - pantry: dry_goods, condiments, other
    - freezer: frozen
- confidence: "high" if you are confident this is a clearly identifiable food item, "low" if the name is ambiguous or unclear

Non-food items (e.g. cleaning products, toiletries, bags) must be excluded entirely.

Any item you cannot confidently parse as a named food ingredient must be placed in the unrecognised list with its raw receipt text.

Return only valid JSON with no explanation, no markdown, and no code fences. Use this exact structure:
{{"recognised": [{{"name": "", "category": "", "quantity": 0, "unit": "", "expiry_days": 0, "expiry_date": "", "location": "", "confidence": "high"}}], "unrecognised": [{{"raw_text": ""}}]}}"""


def parse_receipt(image_bytes: bytes, media_type: str = "image/jpeg") -> dict:
    today_date = date.today().isoformat()
    prompt = SYSTEM_PROMPT.format(today_date=today_date)

    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    model = get_gemini_client("gemini-3-flash-preview")
    response = model.generate_content([
        {"mime_type": media_type, "data": image_base64},
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
