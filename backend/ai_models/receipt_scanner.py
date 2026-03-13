import json
from ai_models.gemini_client import get_gemini_client

SYSTEM_PROMPT = """Extract all food items from this grocery receipt.
For each item return:
- name (full readable name, not abbreviated)
- category: one of [meat, seafood, dairy, produce, deli, dry_goods, frozen, beverages, condiments, other]
- quantity (number)
- unit (g, kg, ml, l, pcs, pack, bottle, box, bag, can)
- expiry_days (integer estimate based on category)
- confidence: "high" if clear food item, "low" if ambiguous

Return only valid JSON, no explanation, no markdown:
{"items": [...], "unrecognised": [...]}"""


def parse_receipt(image_base64: str, media_type: str = "image/jpeg") -> dict:
    model = get_gemini_client('gemini-flash-latest')
    response = model.generate_content([
        {
            "mime_type": media_type,
            "data": image_base64
        },
        SYSTEM_PROMPT
    ])
    return json.loads(response.text)
