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

from ai_models.receipt_scanner_2 import parse_image_to_inventory_items as _parse_receipt_v2
from mongo_collection.schema.recipe_suggestion_schema import RecipeSuggestionSchema
from service.urgency import run_urgency_ranking
from service.spoonacular import fetch_spoonacular_candidates
from util.logger import log_event

load_dotenv()

logger = logging.getLogger(__name__)


def parse_image_to_inventory_items(image_bytes: bytes, media_type: str = "image/jpeg") -> list[dict]:
    """
    Parse a receipt image and return a list of items suitable for InventorySchema.

    Args:
        image_bytes: Raw image file bytes.
        media_type: MIME type of the image (e.g. "image/jpeg").

    Returns:
        List of dicts with keys: name, calories, section, expiry_days, qty, unit, image_url.
    """
    return _parse_receipt_v2(image_bytes, media_type=media_type)


def suggest_recipes_from_inventory(inventory_items: list[dict]) -> list:
    """
    Suggest recipes based on current inventory. Prioritises by expiry urgency.

    Args:
        inventory_items: List of inventory documents from MongoDB.
                         Each dict contains: name, qty, expiry_date, section, added_at, etc.

    Returns:
        List of RecipeSuggestionSchema instances (suggestion_id will be assigned by caller).

    TODO: Replace with real LLM/Spoonacular implementation.
    """
    # Dummy hardcoded list of RecipeSuggestionSchema instances
    return [
        RecipeSuggestionSchema(
            menu="Grilled Cheese Sandwich",
            headcount=2,
            cuisine_type="American",
            nutrition_per_person={"calories": 350, "protein": 12, "carbs": 30, "fat": 20},
            ingredients=[{"name": "Bread", "qty": 4}, {"name": "Cheese", "qty": 2}],
            ingredients_to_buy=[{"name": "Butter", "qty": "2 tbsp"}],
            instruction=[
                "Butter one side of each bread slice.",
                "Place cheese between two slices, buttered sides out.",
                "Grill in a pan over medium heat until golden, 2–3 min per side.",
            ],
            image_url="https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800",
        ),
        RecipeSuggestionSchema(
            menu="Tomato Pasta",
            headcount=1,
            cuisine_type="Italian",
            nutrition_per_person={"calories": 450, "protein": 15, "carbs": 60, "fat": 15},
            ingredients=[{"name": "Pasta", "qty": 100}, {"name": "Tomato", "qty": 2}],
            ingredients_to_buy=[{"name": "Garlic", "qty": "2 cloves"}, {"name": "Olive oil", "qty": "1 tbsp"}],
            instruction=[
                "Boil pasta according to package directions.",
                "Sauté garlic in olive oil, add chopped tomatoes, simmer 10 min.",
                "Toss pasta with sauce and serve.",
            ],
            image_url="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800",
        ),
    ]
