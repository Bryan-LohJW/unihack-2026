import json
from ai_models.gemini_client import get_gemini_client


def generate_meal_plan(inventory: list, prefs: dict) -> dict:
    inventory_text = "\n".join([
        f"- {item['name']}, qty {item['quantity']} {item['unit']}, expires in {item['days_until_expiry']} days"
        for item in inventory  # inventory pre-sorted by expiry_date ASC
    ])

    prompt = f"""You are a meal planning assistant. Generate a {prefs['days']}-day meal plan.

INVENTORY (sorted by expiry, soonest first):
{inventory_text}

PREFERENCES:
- Cuisine: {prefs['cuisine']}
- Goal: {prefs['goal']}
- People: {prefs['people']}
- Mode: {prefs['mode']}

Rules:
- Prioritise items expiring in 3 days or fewer — they must appear in Day 1 meals
- Each meal must use at least one inventory item
- Mark each ingredient as available (in inventory) or needs_buying
- Return only valid JSON, no explanation, no markdown

Schema:
{{"days": [{{"day": 1, "meals": [{{"name": "", "type": "dinner", "uses_expiring": true, "ingredients": [{{"name": "", "quantity": "", "available": true}}], "steps": [], "macros": {{"protein": 0, "carbs": 0, "fat": 0, "calories": 0}}}}]}}]}}"""

    model = get_gemini_client('gemini-flash-latest')
    response = model.generate_content(prompt)
    return json.loads(response.text)
