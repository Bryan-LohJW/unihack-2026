"""
Maps ingredient/item names to the closest static icon image using an LLM.
"""

import json
import re

from ai_models.gemini_client import get_gemini_client


# Static icon library: icon_id -> short description
# TODO: populate with available icon assets
ICON_MAP: dict[str, str] = {}


PROMPT_TEMPLATE = """You are an icon-matching assistant for a kitchen inventory app.

You will be given:
1. A list of food item names to classify.
2. A library of icon IDs, each with a short description.

Your task: for each food item name, choose the single best-matching icon ID from the library.
If nothing fits well, use "generic_food".

Icon library (icon_id: description):
{icon_library}

Food items to classify:
{item_list}

Return ONLY valid JSON with no explanation, no markdown, and no code fences.
Use this exact structure: {{"item_name": "icon_id", ...}}"""


def map_items_to_icons(items: dict) -> dict:
    """
    Match each key in `items` to the closest icon in ICON_MAP.

    Args:
        items: Dict where keys are item name strings and values are ignored (may be None).

    Returns:
        Dict mapping each item name to an icon_id from ICON_MAP.
    """
    if not items:
        return {}

    icon_library_text = "\n".join(
        f"  {icon_id}: {desc}" for icon_id, desc in ICON_MAP.items()
    )
    item_list_text = "\n".join(f"  - {name}" for name in items)

    prompt = PROMPT_TEMPLATE.format(
        icon_library=icon_library_text,
        item_list=item_list_text,
    )

    model = get_gemini_client()
    response = model.generate_content(prompt)

    text = response.text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    result = json.loads(text)

    # Ensure every input key is present and the icon_id is valid
    for key in items:
        if key not in result or result[key] not in ICON_MAP:
            result[key] = "generic_food"

    return result
