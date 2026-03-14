import base64
import json
import re
from datetime import date

from ai_models.gemini_client import get_gemini_client

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
