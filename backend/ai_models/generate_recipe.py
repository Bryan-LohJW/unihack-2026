import json
import os
import re

import requests
from ai_models.gemini_client import get_gemini_client

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY", "")


def fetch_recipe_images(menu_names: list[str]) -> dict[str, str]:
    """Return {menu_name: image_url} for each name via Spoonacular complexSearch."""
    images = {}
    for name in menu_names:
        try:
            resp = requests.get(
                "https://api.spoonacular.com/recipes/complexSearch",
                params={"apiKey": SPOONACULAR_API_KEY, "query": name, "number": 1},
                timeout=10,
            )
            resp.raise_for_status()
            results = resp.json().get("results", [])
            images[name] = results[0]["image"] if results else ""
        except Exception:
            images[name] = ""
    return images

SYSTEM_PROMPT = """
You are a personal chef assistant for a kitchen inventory app called D-Larder.

Your job is to generate exactly 3 recipe options based on the user's current inventory and their stated preferences. Recipes must make practical use of what the user already has, prioritising ingredients that are expiring soonest.

CURRENT INVENTORY (sorted by expiry date, soonest first):
{inventory_list}

USER PREFERENCES:
- Cuisine: {cuisine}
- Dietary restrictions: {dietary_requirements}
- Number of servings: {servings}

RULES:
- Generate exactly 3 distinct recipe options. Each must be meaningfully different from the others.
- Prioritise ingredients expiring within 3 days — at least one of these must appear in every recipe where possible.
- Where possible, use ingredients available in the inventory or suitable alternatives, but you may also suggest items to be bought to complete the recipe — place any ingredient not in the inventory in "ingredients_to_buy" instead of "ingredients".
- Each recipe must align with the user's dietary restrictions and cuisine preference.
- Prep time should be realistic and reflect the actual steps involved.

Return only valid JSON with no explanation, no markdown, and no code fences. Use this exact structure:
{{
  "recipes": [
    {{
      "menu": "",
      "headcount": 0,
      "cuisine_type": "",
      "nutrition_per_person": {{
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0
      }},
      "ingredients": [
        {{
          "name": "",
          "quantity": "",
          "unit": ""
        }}
      ],
      "ingredients_to_buy": [
        {{
          "name": "",
          "quantity": "",
          "unit": ""
        }}
      ],
      "instruction": [
        ""
      ]
    }}
  ]
}}
"""


def generate_recipe(
    inventory_items: list[dict],
    cuisine: list[str],
    dietary_requirements: list[str],
    quantity: int,
) -> dict:
    sorted_inventory = sorted(
        inventory_items,
        key=lambda x: x.get("expiry_date") or "",
    )
    inventory_list = "\n".join(
        f"- {item.get('name')} | qty: {item.get('qty')} {item.get('unit', '')} | expires: {item.get('expiry_date', 'unknown')}"
        for item in sorted_inventory
    )

    prompt = SYSTEM_PROMPT.format(
        inventory_list=inventory_list,
        cuisine=", ".join(cuisine) if cuisine else "any",
        dietary_requirements=", ".join(dietary_requirements) if dietary_requirements else "none",
        servings=quantity,
    )

    model = get_gemini_client("gemini-3-flash-preview")
    response = model.generate_content([
        prompt,
    ])
    print("Gemini response:", response.text)
    text = response.text.strip()
    # Strip markdown code fences if Gemini wraps the response
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    result = json.loads(text)

    menu_names = [recipe.get("menu") for recipe in result.get("recipes", [])]
    print("Generated menus:", menu_names)

    return result
