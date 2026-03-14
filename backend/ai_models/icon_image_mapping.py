"""
Maps ingredient/item names to the closest static icon image using an LLM.
"""

import json
import re

from ai_models.gemini_client import get_gemini_client


# Static icon library: icon filename (with extension) -> short description
# Filenames match files in fresh-track-app/public/icons/
ICON_MAP: dict[str, str] = {
    "apple.png":           "red or green apple fruit",
    "banana.png":          "yellow banana fruit",
    "beef_mince.png":      "minced beef or ground beef",
    "bread.png":           "loaf or slices of bread",
    "butter.png":          "block or pack of butter",
    "can_food.png":        "generic canned or tinned food",
    "capsicum.png":        "red, green, or yellow capsicum or bell pepper",
    "carrot.png":          "orange carrot vegetable",
    "cheese.png":          "block or slice of cheese",
    "chicken.png":         "raw or cooked chicken meat or poultry",
    "eggs.png":            "chicken eggs",
    "fish.png":            "whole fish or fish fillet",
    "flour.png":           "bag or pack of flour or baking powder",
    "frozen_bag.png":      "frozen food bag or frozen meal",
    "garlic.png":          "garlic bulb or garlic cloves",
    "green_vegetable.png": "generic green vegetable such as broccoli, spinach, zucchini, or lettuce",
    "ice_cream.png":       "ice cream tub, scoop, or frozen dessert",
    "lemon.png":           "yellow lemon or lime citrus fruit",
    "milk.png":            "bottle or carton of milk or plant-based milk",
    "mushroom.png":        "mushroom or fungi",
    "noodles.png":         "noodles, pasta, spaghetti, or ramen",
    "oats.png":            "oats, rolled oats, or porridge",
    "oil.png":             "bottle of cooking oil, olive oil, or vegetable oil",
    "onion.png":           "brown, white, or red onion or shallot",
    "orange.png":          "orange citrus fruit",
    "potato.png":          "brown potato or sweet potato",
    "red_meat.png":        "red meat steak, lamb chop, or pork chop",
    "rice.png":            "white or brown rice grains or bag",
    "sauce.png":           "bottle or jar of sauce, gravy, or dressing",
    "shrimp.png":          "shrimp, prawn, or other shellfish",
    "strawberry.png":      "red strawberry or berry fruit",
    "tomato.png":          "red tomato",
    "tomato_sauce.png":    "bottle or can of tomato sauce, passata, or ketchup",
    "unknown.png":         "unidentified or generic food item",
    "yoghurt.png":         "yogurt pot, Greek yogurt, or dairy dessert",
}


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

    model = get_gemini_client('gemini-flash-lite-latest')
    response = model.generate_content(prompt)

    text = response.text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    result = json.loads(text)

    # Ensure every input key is present and the icon_id is valid
    for key in items:
        if key not in result or result[key] not in ICON_MAP:
            result[key] = "unknown.png"

    return result
