"""
LLM service layer.

- parse_image_to_inventory_items: receipt OCR (existing)
- infer_expiry: Gemini 2.5 Flash expiry inference (PRD §5.2)
- suggest_recipes_from_inventory: full recipe pipeline (PRD §11)
"""

import json
import os
import logging

from dotenv import load_dotenv
from google import genai

from ai_models.receipt_scanner import parse_receipt
from ai_models.icon_image_mapping import map_items_to_icons
from service.urgency import run_urgency_ranking
from service.spoonacular import fetch_spoonacular_candidates
from util.logger import log_event

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Gemini client setup — new google-genai SDK
# ---------------------------------------------------------------------------
_genai_client = None


def _get_genai_client() -> genai.Client:
    global _genai_client
    if _genai_client is None:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in environment.")
        _genai_client = genai.Client(api_key=api_key)
    return _genai_client


# ---------------------------------------------------------------------------
# Langfuse (optional — graceful if keys missing)
# ---------------------------------------------------------------------------
_langfuse = None


def _get_langfuse():
    global _langfuse
    if _langfuse is None:
        try:
            from langfuse import Langfuse

            pub = os.getenv("LANGFUSE_PUBLIC_KEY", "")
            sec = os.getenv("LANGFUSE_SECRET_KEY", "")
            host = os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
            if pub and sec:
                _langfuse = Langfuse(public_key=pub, secret_key=sec, host=host)
        except Exception:
            pass
    return _langfuse


# ---------------------------------------------------------------------------
# Fallback shelf-life table (PRD §5.2)
# ---------------------------------------------------------------------------
FALLBACK_SHELF_LIFE = {
    "chicken": 2, "meat": 2, "beef": 2, "pork": 2, "lamb": 2,
    "fish": 2, "salmon": 2, "shrimp": 2, "prawn": 2,
    "lettuce": 4, "spinach": 4, "kale": 4, "greens": 4, "salad": 4,
    "milk": 5, "yogurt": 5, "cheese": 5, "cream": 5, "dairy": 5, "bread": 5,
    "carrot": 14, "potato": 14, "onion": 14, "beet": 14, "turnip": 14,
    "rice": 365, "pasta": 365, "oil": 365, "flour": 365, "sugar": 365,
    "salt": 365, "vinegar": 365, "soy sauce": 365,
}


def _fallback_expiry_days(item_name: str) -> int:
    """Return a default shelf life based on keyword matching."""
    name_lower = item_name.lower()
    for keyword, days in FALLBACK_SHELF_LIFE.items():
        if keyword in name_lower:
            return days
    return 7  # generic default


# ---------------------------------------------------------------------------
# Expiry inference — Gemini 2.5 Flash (PRD §5.2)
# ---------------------------------------------------------------------------

def infer_expiry_single(item_name: str, added_at: str) -> dict:
    """Infer expiry for a single item using Gemini 2.5 Flash."""
    prompt = (
        "You are a food safety assistant. Given a food item name and the date it was added to the fridge, "
        "return ONLY a valid JSON object with two fields:\n"
        '- "expiry_days": integer (estimated days until spoilage from added_at, assume fridge storage unless item is pantry staple)\n'
        '- "expiry_date": ISO 8601 date string (added_at + expiry_days)\n\n'
        f"Food item: {item_name}\n"
        f"Added at: {added_at}\n\n"
        "Return only the JSON. No explanation."
    )
    try:
        lf = _get_langfuse()
        trace = None
        generation = None
        if lf:
            trace = lf.trace(name="infer_expiry")
            generation = trace.generation(
                name="gemini_flash_expiry_single",
                model="gemini-2.5-flash",
                input=prompt,
            )

        client = _get_genai_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        text = response.text.strip()

        if generation:
            generation.end(output=text)

        clean_json = text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_json)
    except Exception as e:
        logger.warning("Flash expiry inference failed for %s: %s — using fallback", item_name, e)
        from datetime import datetime, timedelta
        added = datetime.fromisoformat(added_at)
        days = _fallback_expiry_days(item_name)
        expiry = added + timedelta(days=days)
        return {
            "expiry_days": days,
            "expiry_date": expiry.strftime("%Y-%m-%d"),
        }


def infer_expiry_batch(items: list[dict], added_at: str) -> list[dict]:
    """Infer expiry for multiple items in one Flash call.

    Each item in *items* must have a ``name`` key.
    """
    from datetime import datetime, timedelta

    id_items = [{"id": i, "name": item.get("name", "Unknown")} for i, item in enumerate(items)]
    added = datetime.fromisoformat(added_at)

    prompt = (
        "You are a food safety assistant. Given a list of food items and the date they were added to the fridge,\n"
        "return ONLY a valid JSON array. Each element must correspond to one input item and include:\n"
        '- "id": integer (same id as provided in the input — required)\n'
        '- "expiry_days": integer (estimated days until spoilage from added_at, assume fridge storage unless pantry staple)\n'
        '- "expiry_date": ISO 8601 date string (added_at + expiry_days)\n\n'
        f"Items: {json.dumps(id_items)}\n"
        f"Added at: {added_at}\n\n"
        "Return only the JSON array. No explanation."
    )

    id_map: dict[int, dict] = {}
    try:
        lf = _get_langfuse()
        trace = None
        generation = None
        if lf:
            trace = lf.trace(name="infer_expiry")
            generation = trace.generation(
                name="gemini_flash_expiry_batch",
                model="gemini-2.5-flash",
                input=prompt,
            )

        client = _get_genai_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        text = response.text.strip()

        if generation:
            generation.end(output=text)

        clean_json = text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean_json)
        id_map = {r["id"]: r for r in parsed if "id" in r}
    except Exception as e:
        logger.warning("Batch expiry inference failed: %s — using fallback", e)

    results = []
    for entry in id_items:
        item_id = entry["id"]
        name = entry["name"]
        if item_id in id_map:
            r = id_map[item_id]
            days = r.get("expiry_days") or _fallback_expiry_days(name)
            expiry_date = r.get("expiry_date") or (added + timedelta(days=days)).strftime("%Y-%m-%d")
            results.append({"name": name, "expiry_days": days, "expiry_date": expiry_date})
        else:
            days = _fallback_expiry_days(name)
            results.append({
                "name": name,
                "expiry_days": days,
                "expiry_date": (added + timedelta(days=days)).strftime("%Y-%m-%d"),
            })
    return results


# ---------------------------------------------------------------------------
# Receipt parsing (existing — kept intact)
# ---------------------------------------------------------------------------

def parse_image_to_inventory_items(image_bytes: bytes, media_type: str = "image/jpeg") -> list[dict]:
    """Parse a receipt image and return a list of items suitable for InventorySchema.

    Calls infer_expiry_batch once for all recognised items — one Flash call regardless
    of how many items are on the receipt (PRD §5.2, §17 quota mitigation).
    """
    from datetime import datetime, timezone as tz

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

    if not items:
        return items

    # Batch expiry inference — single Flash call for all items
    added_at = datetime.now(tz.utc).isoformat()
    expiry_results = infer_expiry_batch(items, added_at)
    expiry_map = {r.get("name", "").lower(): r for r in expiry_results}
    for item in items:
        inferred = expiry_map.get(item["name"].lower(), {})
        if inferred.get("expiry_days"):
            item["expiry_days"] = inferred["expiry_days"]

    # Icon mapping
    icon_input = {item["name"]: None for item in items}
    icon_mapping = map_items_to_icons(icon_input)
    for item in items:
        item["image_url"] = icon_mapping.get(item["name"], "unknown.png")

    return items


# ---------------------------------------------------------------------------
# LLM ranking — Gemini 2.5 Pro (PRD §8)
# ---------------------------------------------------------------------------

_RANKING_SYSTEM_PROMPT = """\
You are a food waste reduction assistant for Australian households. Your job is to rank \
recipe candidates by balancing two priorities: using up urgent ingredients (food waste \
prevention) and minimising shopping friction (fewest missing ingredients).

Ranking Rules (apply in strict order):

Rule 1 — The Mission Cap:
Recipes that use CRITICAL or HIGH urgency ingredients MUST rank at the top, BUT ONLY IF \
they require 4 or fewer missing ingredients. These recipes are the best candidates because \
they save food AND are practical to cook.

Rule 2 — The Reality Check:
If a recipe uses a CRITICAL ingredient but requires 5 or more missing ingredients, DEMOTE it. \
Instead, promote a HIGH or MODERATE urgency recipe that requires 0–2 missing ingredients. \
A user is far more likely to cook a simpler meal than go on a major shopping trip.

Rule 3 — Ingredient Friction > Ingredient Count:
Evaluate the TYPE of missing ingredients, not just the count. A recipe missing 3 common \
staples (e.g., butter, onion, garlic) should rank HIGHER than a recipe missing 1 obscure \
or expensive ingredient (e.g., saffron, truffle oil, miso paste). Common pantry staples \
are low-friction; specialty items are high-friction.

Rule 4 — The 'Why' in urgency_reason:
For each recipe, write the urgency_reason as a persuasive, shopping-oriented message. \
Estimate the approximate dollar value (AUD) of the urgent ingredients being saved, based \
on typical Australian grocery prices. Keep estimates conservative and realistic — only \
calculate the value of main proteins and produce, not pantry staples. \
Example: "Your chicken expires TODAY. You only need to grab bell peppers — this saves roughly $10 of food from the bin."

Rule 5 - Realistic Macro Estimation:
Spoonacular's scraped nutrition data is often mathematically broken due to vague serving sizes. Ignore it. \
For each recipe, generate a highly realistic, estimated `nutrition_per_person` object \
(calories (float), protein (float), carbs (float), fat (float)) based on standard adult portion sizes. \
Example: "A chicken and rice dinner should be ~400-600 kcal, not 80 kcal."

Additional rules:
- Return the top 3–5 recipes only.
- For `ingredients_used`, the `qty_used` for each item MUST NOT exceed the quantity \
available in the user's inventory. The inventory is provided with each item's `qty` — \
never output a `qty_used` larger than that value. If a recipe calls for more than the \
user has, cap `qty_used` at the inventory quantity.
- Return output ONLY as valid JSON matching the schema below — no preamble, no \
markdown fences, no text outside the JSON.

Output JSON schema:
{
  "recipes": [
    {
      "id": <spoonacular_recipe_id>,
      "name": "<recipe name>",
      "urgency_reason": "<persuasive message with AUD savings estimate>",
      "ingredients_used": [
        { "item": "<name>", "qty_used": <number>, "unit": "<unit>" }
      ],
      "ingredients_optional": [
        { "item": "<name>", "qty_used": <number>, "unit": "<unit>" }
      ],
      "missing_ingredients": ["<name>", ...],
      "missing_ingredients_count": <integer>,
      "nutrition_per_person": {
      "calories": <float>,
      "protein": <float>,
      "carbs": <float>,
      "fat": <float>
      },
      "image_url": "<url>"
    }
  ],
  "expired_items_warning": ["<item_name>", ...]
}

Do NOT include cuisine_type, steps, prep_time_minutes, or servings — those are sourced externally.\
"""


def rank_with_gemini(
    candidates: list[dict],
    ranked_items: list[dict],
    expired_warnings: list[str],
    conversation_history: list[dict] | None = None,
    user_message: str | None = None,
    user_id: str = "",
) -> dict:
    """Call Gemini 2.5 Pro to re-rank Spoonacular candidates by urgency."""

    context = {
        "inventory": ranked_items,
        "spoonacular_candidates": candidates,
        "conversation_history": conversation_history or [],
        "expired_items_warning": expired_warnings,
    }
    if user_message:
        context["user_message"] = user_message

    user_prompt = json.dumps(context, default=str)

    lf = _get_langfuse()
    trace = None
    generation = None
    # if lf:
    #     trace = lf.trace(name="rank_recipes", user_id=user_id)
    #     generation = trace.generation(
    #         name="gemini_pro_ranking",
    #         model="gemini-2.5-pro",
    #         input=user_prompt,
    #     )

    client = _get_genai_client()
    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=[
            {"role": "user", "parts": [{"text": user_prompt}]},
        ],
        config={
            "system_instruction": _RANKING_SYSTEM_PROMPT,
        },
    )
    text = response.text.strip()

    if generation:
        generation.end(output=text)

    clean_json = text.replace("```json", "").replace("```", "").strip()
    return json.loads(clean_json)


# ---------------------------------------------------------------------------
# Main entry point (PRD §11.1)
# ---------------------------------------------------------------------------

def suggest_recipes_from_inventory(inventory_items: list[dict]) -> dict:
    """
    Suggest recipes based on current inventory. Prioritises by expiry urgency.

    Args:
        inventory_items: List of inventory documents from MongoDB.
                         Each dict contains: name, qty, expiry_date, section, added_at, etc.

    Returns:
        Dict with keys: recipes, mode, user_message, expired_items_warning.
        mode is one of "urgency", "standard", or "empty_fridge".
    """
    # 1. Urgency ranking
    ranked_items, expired_warnings = run_urgency_ranking(inventory_items)

    if not ranked_items:
        return {
            "recipes": [],
            "mode": "empty_fridge",
            "user_message": "Your fridge is looking pretty empty \u2014 try adding some items first.",
            "expired_items_warning": expired_warnings,
        }

    has_urgent = any(i["urgency"] in ("CRITICAL", "HIGH") for i in ranked_items)
    mode = "urgency" if has_urgent else "standard"

    # 2. Spoonacular query + enrichment
    candidates = fetch_spoonacular_candidates(ranked_items)
    if not candidates:
        return {
            "recipes": [],
            "mode": "empty_fridge",
            "user_message": "Your fridge is looking pretty empty \u2014 try adding some items first.",
            "expired_items_warning": expired_warnings,
        }

    # 3. LLM ranking via Gemini 2.5 Pro
    llm_result = rank_with_gemini(
        candidates=candidates,
        ranked_items=ranked_items,
        expired_warnings=expired_warnings,
    )

    # 4. Merge Spoonacular metadata back into LLM output + cap quantities
    candidate_map = {c["id"]: c for c in candidates}
    inv_qty = {i["item"].lower(): i["qty"] for i in ranked_items}
    recipes = []
    for recipe in llm_result.get("recipes", []):
        rid = recipe.get("id")
        spoon = candidate_map.get(rid, {})

        # Cap ingredients_used to actual inventory quantities
        for ing in recipe.get("ingredients_used", []):
            item_key = ing.get("item", "").lower()
            available = inv_qty.get(item_key)
            if available is not None and ing.get("qty_used", 0) > available:
                ing["qty_used"] = available

        # Ensure missing_ingredients_count is present
        # Extract the exact names directly from Spoonacular's data
        missing_items = spoon.get("missed_ingredients", [])
        recipe["missing_ingredients"] = [item.get("name") for item in missing_items]
        recipe["missing_ingredients_count"] = len(recipe["missing_ingredients"])

        recipe["cuisine_type"] = spoon.get("cuisine_type", "Unknown")
        recipe["steps"] = spoon.get("steps", [])
        recipe["prep_time_minutes"] = spoon.get("prep_time_minutes", 0)
        recipe["servings"] = spoon.get("servings", 1)
        if not recipe.get("image_url"):
            recipe["image_url"] = spoon.get("image_url", "")
        recipes.append(recipe)

    return {
        "recipes": recipes,
        "mode": mode,
        "user_message": None,
        "expired_items_warning": expired_warnings,
    }
