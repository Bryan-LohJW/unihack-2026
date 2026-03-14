"""
Spoonacular integration via the official Spoonacular API.
See PRD Section 7.

Caching: results are stored in MongoDB `spoonacular_cache` with a 24h TTL
keyed on a stable hash of the sorted ingredient list. Same inventory state
never hits Spoonacular twice in the same day.
"""

import hashlib
import os
from datetime import datetime, timedelta, timezone

import requests
from dotenv import load_dotenv

load_dotenv()

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY", "")

BASE_URL = "https://api.spoonacular.com"

CACHE_TTL_HOURS = 24


def build_spoonacular_query(ranked_items: list[dict]) -> str:
    """Build comma-separated ingredient string from urgency-ranked items.

    Smart Context Cap: Always include ALL CRITICAL + HIGH items.
    Add up to 5 MODERATE/LOW items sorted by nearest expiry.
    """
    critical_high = [
        i["item"] for i in ranked_items if i["urgency"] in ("CRITICAL", "HIGH")
    ]
    moderate_low = sorted(
        [i for i in ranked_items if i["urgency"] in ("MODERATE", "LOW")],
        key=lambda x: x.get("expires_in_days", 999),
    )
    extras = [i["item"] for i in moderate_low[:5]]
    
    # FIX: Combine and deduplicate to prevent multiple of the same item (e.g., 5 chicken breasts)
    # dict.fromkeys() removes duplicates while preserving the exact urgency order
    all_items = critical_high + extras
    unique_items = list(dict.fromkeys(all_items))
    
    return ",".join(unique_items)


def fetch_recipes_by_ingredients(ingredients_csv: str, number: int = 10) -> list[dict]:
    """Call /recipes/findByIngredients and return raw results."""
    url = f"{BASE_URL}/recipes/findByIngredients"
    params = {
        "apiKey": SPOONACULAR_API_KEY,
        "ingredients": ingredients_csv,
        "number": number,
        "ranking": 2,
        "ignorePantry": "false",
    }
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


def fetch_recipe_information(recipe_id: int) -> dict:
    """Call /recipes/{id}/information to get full recipe details.

    Extracts nutrition_per_person and cuisine_type from the response.
    """
    url = f"{BASE_URL}/recipes/{recipe_id}/information"
    params = {
        "apiKey": SPOONACULAR_API_KEY,
        "includeNutrition": "true",
    }
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


_CUISINE_KEYWORDS: list[tuple[str, list[str]]] = [
    ("Italian", ["pasta", "pizza", "risotto", "lasagna", "parmesan", "marinara", "basil", "gnocchi", "ravioli", "tiramisu"]),
    ("Asian", ["stir fry", "fried rice", "noodle", "ramen", "udon", "sushi", "dumpling", "tempura", "teriyaki", "pad thai", "pho", "banh mi"]),
    ("Chinese", ["kung pao", "mapo", "dim sum", "wonton", "chow mein", "bok choy", "hoisin", "szechuan"]),
    ("Japanese", ["miso", "sushi", "ramen", "teriyaki", "tonkatsu", "udon", "soba", "tempura", "yakitori"]),
    ("Korean", ["kimchi", "bibimbap", "bulgogi", "japchae", "tteok", "korean"]),
    ("Thai", ["thai", "pad thai", "thai basil", "coconut milk", "lemongrass", "green curry", "red curry"]),
    ("Indian", ["curry", "masala", "tikka", "biryani", "naan", "paneer", "dal", "chutney", "tandoori", "samosa"]),
    ("Mexican", ["taco", "burrito", "salsa", "guacamole", "tortilla", "enchilada", "quesadilla", "fajita", "jalapeño", "chipotle"]),
    ("Mediterranean", ["greek", "hummus", "falafel", "tahini", "pita", "shawarma", "tzatziki", "olive", "feta", "kebab"]),
    ("French", ["french", "croissant", "crepe", "bisque", "ratatouille", "beurre", "provençal", "gratin", "soufflé", "quiche"]),
    ("American", ["burger", "bbq", "barbecue", "ranch", "bacon", "mac and cheese", "hot dog", "coleslaw", "cornbread"]),
    ("Hawaiian", ["hawaiian", "pineapple", "teriyaki", "kalua", "poke", "loco moco"]),
]


def _infer_cuisine_from_title(title: str) -> str:
    """Infer cuisine from recipe title via keyword matching. Returns 'Unknown' if no match."""
    lower = title.lower()
    for cuisine, keywords in _CUISINE_KEYWORDS:
        if any(kw in lower for kw in keywords):
            return cuisine
    return "Unknown"


def extract_nutrition_and_meta(info: dict) -> dict:
    """Extract nutrition_per_person and cuisine_type from Spoonacular recipe info."""
    servings = info.get("servings", 1) or 1

    nutrition_per_person = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    nutrients = (info.get("nutrition") or {}).get("nutrients") or []
    nutrient_map = {
        "Calories": "calories",
        "Protein": "protein",
        "Carbohydrates": "carbs",
        "Fat": "fat",
    }
    for n in nutrients:
        key = nutrient_map.get(n.get("name"))
        if key:
            nutrition_per_person[key] = round(n.get("amount", 0) / servings, 1)

    cuisines = info.get("cuisines") or []
    if cuisines:
        cuisine_type = cuisines[0]
    else:
        cuisine_type = _infer_cuisine_from_title(info.get("title", ""))

    steps_raw = []
    for instr in info.get("analyzedInstructions") or []:
        for step in instr.get("steps") or []:
            steps_raw.append(step.get("step", ""))

    return {
        "nutrition_per_person": nutrition_per_person,
        "cuisine_type": cuisine_type,
        "steps": steps_raw,
        "prep_time_minutes": info.get("readyInMinutes", 0),
        "servings": servings,
    }


def _cache_key(ingredients_csv: str) -> str:
    """Stable, order-independent cache key from ingredient list."""
    normalized = ",".join(sorted(i.strip().lower() for i in ingredients_csv.split(",")))
    return hashlib.md5(normalized.encode()).hexdigest()


def fetch_spoonacular_candidates(ranked_items: list[dict]) -> list[dict]:
    """Full Spoonacular pipeline: findByIngredients → enrichment per recipe.

    Results are cached in MongoDB for 24 hours per unique ingredient combination.
    Returns enriched candidate list ready for LLM ranking.
    """
    from db import mongo

    ingredients_csv = build_spoonacular_query(ranked_items)
    if not ingredients_csv:
        return []

    # --- Cache lookup ---
    key = _cache_key(ingredients_csv)
    now = datetime.now(timezone.utc)
    try:
        cached = mongo.db.spoonacular_cache.find_one(
            {"key": key, "expires_at": {"$gt": now}}
        )
    except Exception as e:
        print(f"Mongo cache error: {e}")
        cached = None
    if cached:
        return cached["candidates"]

    # --- Cache miss: fetch fresh from Spoonacular ---
    raw_results = fetch_recipes_by_ingredients(ingredients_csv)
    candidates = []

    for r in raw_results:
        recipe_id = r.get("id")
        if not recipe_id:
            continue
        try:
            info = fetch_recipe_information(recipe_id)
        except Exception:
            continue

        meta = extract_nutrition_and_meta(info)

        used = [
            {"name": u.get("name", ""), "amount": u.get("amount", 0), "unit": u.get("unitShort", "")}
            for u in r.get("usedIngredients", [])
        ]
        missed = [
            {"name": m.get("name", ""), "amount": m.get("amount", 0), "unit": m.get("unitShort", "")}
            for m in r.get("missedIngredients", [])
        ]

        candidates.append({
            "id": recipe_id,
            "name": r.get("title", ""),
            "image_url": r.get("image", ""),
            "used_ingredients": used,
            "missed_ingredients": missed,
            "nutrition_per_person": meta["nutrition_per_person"],
            "cuisine_type": meta["cuisine_type"],
            "steps": meta["steps"],
            "prep_time_minutes": meta["prep_time_minutes"],
            "servings": meta["servings"],
        })

    # --- Write to cache (only if non-empty — never cache poisoned empty results) ---
    if candidates:
        try:
            mongo.db.spoonacular_cache.update_one(
                {"key": key},
                {"$set": {
                    "key": key,
                    "ingredients": ingredients_csv,
                    "candidates": candidates,
                    "created_at": now,
                    "expires_at": now + timedelta(hours=CACHE_TTL_HOURS),
                }},
                upsert=True,
            )
        except Exception as e:
            print(f"Mongo cache error: {e}")

    return candidates
