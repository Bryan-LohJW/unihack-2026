"""
Recipe endpoints — PRD Section 12.

POST /recipe/generate   — new recipe generation session
POST /recipe/correct    — quantity correction within session -- CAN DELETE
POST /recipe/cooked     — mark recipe cooked, passive deduction -- CAN DELETE
POST /recipe/skip       — log that a recipe was skipped -- CAN DELETEc
"""

from datetime import datetime, timezone

from flask import Blueprint, request, jsonify

from db import mongo
from service.session_manager import (
    get_active_session,
    create_session,
    touch_session,
    append_to_history,
)
from service.urgency import run_urgency_ranking
from service.spoonacular import fetch_spoonacular_candidates
from service.llm_client import (
    suggest_recipes_from_inventory,
    rank_with_gemini,
)
from util.logger import log_event

recipe_bp = Blueprint("recipe", __name__, url_prefix="/recipe")


def init_recipe_routes(db):
    # ------------------------------------------------------------------ #
    # POST /recipe/generate
    # ------------------------------------------------------------------ #
    @recipe_bp.route("/generate", methods=["POST"])
    def generate():
        data = request.get_json(force=True)

        # Fetch current inventory from MongoDB
        inventory_items = list(mongo.db.inventory.find(
            {},
            {"_id": 1, "name": 1, "expiry_date": 1, "qty": 1, "unit": 1},
        ))

        if not inventory_items:
            return jsonify({"error": "No inventory items found"}), 404

        # Normalise for pipeline
        # inv_payload = _normalise_inventory(inventory_items)

        # Create a new session
        # session = create_session(user_id, inv_payload)
        # session_id = session["session_id"]

        # Run the full pipeline
        result = suggest_recipes_from_inventory(inventory_items)
        recipes = result["recipes"]
        mode = result["mode"]
        user_message = result.get("user_message")

        return jsonify({
            "session_id": session_id,
            "recipes": recipes,
            "mode": mode,
            "user_message": user_message,
            "expired_items_warning": result.get("expired_items_warning", _expired_items(inv_payload)),
        }), 200

    # ------------------------------------------------------------------ #
    # POST /recipe/correct
    # ------------------------------------------------------------------ #
    @recipe_bp.route("/correct", methods=["POST"])
    def correct():
        data = request.get_json(force=True)
        session_id = data.get("session_id")
        corrections = data.get("corrections", [])

        if not session_id:
            return jsonify({"error": "session_id is required"}), 400

        session = get_active_session(session_id)
        if not session:
            return jsonify({"error": "Session expired or not found. Start a new /recipe/generate request."}), 410

        user_id = session.get("user_id", "")

        # Apply corrections to MongoDB first
        for correction in corrections:
            item_name = correction.get("item")
            actual_qty = correction.get("actual_qty")
            if item_name is None or actual_qty is None:
                continue

            existing = mongo.db.inventory.find_one({"name": item_name})
            qty_before = existing.get("qty", 0) if existing else 0

            mongo.db.inventory.update_one(
                {"name": item_name},
                {"$set": {"qty": actual_qty}},
            )

            log_event(
                event_type="correction_made",
                user_id=user_id,
                session_id=session_id,
                payload={
                    "item": item_name,
                    "qty_before": qty_before,
                    "qty_after": actual_qty,
                    "triggered_new_recommendation": True,
                },
            )

        # Re-fetch updated inventory
        inventory_items = list(mongo.db.inventory.find({"user_id": user_id}))
        if not inventory_items:
            inventory_items = list(mongo.db.inventory.find())

        inv_payload = _normalise_inventory(inventory_items)

        # Re-run pipeline with conversation history
        ranked_items, expired_warnings = run_urgency_ranking(inv_payload)
        candidates = fetch_spoonacular_candidates(ranked_items) if ranked_items else []

        # Determine mode
        has_urgent = any(i["urgency"] in ("CRITICAL", "HIGH") for i in ranked_items) if ranked_items else False
        mode = "urgency" if has_urgent else ("standard" if ranked_items else "empty_fridge")

        conversation_history = session.get("conversation_history", [])

        if ranked_items and candidates:
            llm_result = rank_with_gemini(
                candidates=candidates,
                ranked_items=ranked_items,
                expired_warnings=expired_warnings,
                conversation_history=conversation_history,
                user_message="User corrected quantities: " + str(corrections),
                user_id=user_id,
            )
            # Merge Spoonacular metadata
            candidate_map = {c["id"]: c for c in candidates}
            recipes = []
            for recipe in llm_result.get("recipes", []):
                rid = recipe.get("id")
                spoon = candidate_map.get(rid, {})
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
        else:
            recipes = []

        import json
        append_to_history(session_id, "user", "Correction: " + json.dumps(corrections))
        append_to_history(session_id, "assistant", json.dumps(recipes, default=str))
        touch_session(session_id)

        return jsonify({
            "session_id": session_id,
            "recipes": recipes,
            "mode": mode,
            "user_message": None,
            "expired_items_warning": expired_warnings,
        }), 200

    # ------------------------------------------------------------------ #
    # POST /recipe/cooked
    # ------------------------------------------------------------------ #
    @recipe_bp.route("/cooked", methods=["POST"])
    def cooked():
        data = request.get_json(force=True)
        session_id = data.get("session_id")
        recipe_id = data.get("recipe_id")

        if not session_id or not recipe_id:
            return jsonify({"error": "session_id and recipe_id are required"}), 400

        session = get_active_session(session_id)
        if not session:
            return jsonify({"error": "Session expired or not found."}), 410

        user_id = session.get("user_id", "")

        # Find the recipe in conversation history to get ingredients_used
        import json
        recipe_data = None
        recipe_name = ""
        ingredients_used = []
        for entry in reversed(session.get("conversation_history", [])):
            if entry.get("role") == "assistant":
                try:
                    parsed = json.loads(entry["content"])
                    if isinstance(parsed, list):
                        for r in parsed:
                            if str(r.get("id")) == str(recipe_id):
                                recipe_data = r
                                break
                except (json.JSONDecodeError, TypeError):
                    pass
                if recipe_data:
                    break

        if recipe_data:
            recipe_name = recipe_data.get("name", "")
            ingredients_used = recipe_data.get("ingredients_used", [])

        # Passive deduction
        items_depleted = []
        for ing in ingredients_used:
            item_name = ing.get("item", "")
            qty_used = ing.get("qty_used", 0)
            if not item_name or qty_used <= 0:
                continue

            existing = mongo.db.inventory.find_one({"name": {"$regex": item_name, "$options": "i"}})
            if not existing:
                continue

            new_qty = existing.get("qty", 0) - qty_used
            if new_qty <= 0:
                mongo.db.inventory.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {"qty": 0, "depleted": True}},
                )
                items_depleted.append(item_name)
            else:
                mongo.db.inventory.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {"qty": new_qty}},
                )

        log_event(
            event_type="recipe_cooked",
            user_id=user_id,
            session_id=session_id,
            payload={
                "recipe_id": recipe_id,
                "recipe_name": recipe_name,
                "ingredients_used": ingredients_used,
            },
        )

        touch_session(session_id)

        return jsonify({"status": "ok", "items_depleted": items_depleted}), 200

    # ------------------------------------------------------------------ #
    # POST /recipe/skip
    # ------------------------------------------------------------------ #
    @recipe_bp.route("/skip", methods=["POST"])
    def skip():
        data = request.get_json(force=True)
        session_id = data.get("session_id")
        recipe_id = data.get("recipe_id")
        recipe_name = data.get("recipe_name", "")

        if not session_id or not recipe_id:
            return jsonify({"error": "session_id and recipe_id are required"}), 400

        session = get_active_session(session_id)
        if not session:
            return jsonify({"error": "Session expired or not found."}), 410

        user_id = session.get("user_id", "")

        log_event(
            event_type="recipe_skipped",
            user_id=user_id,
            session_id=session_id,
            payload={
                "recipe_id": recipe_id,
                "recipe_name": recipe_name,
            },
        )

        touch_session(session_id)

        return jsonify({"status": "ok"}), 200

    return recipe_bp


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalise_inventory(items: list[dict]) -> list[dict]:
    """Normalise raw MongoDB inventory docs for the pipeline."""
    result = []
    for item in items:
        d = {
            "name": item.get("name"),
            "qty": item.get("qty", 1),
            "expiry_date": item.get("expiry_date"),
            "section": item.get("section"),
            "added_at": item.get("added_at"),
        }
        if item.get("unit"):
            d["unit"] = item["unit"]
        result.append(d)
    return result


def _urgency_summary(inv_payload: list[dict]) -> dict:
    """Quick counts per urgency tier."""
    from service.urgency import run_urgency_ranking
    ranked, _ = run_urgency_ranking(inv_payload)
    summary = {"CRITICAL": 0, "HIGH": 0, "MODERATE": 0, "LOW": 0}
    for r in ranked:
        label = r.get("urgency", "LOW")
        summary[label] = summary.get(label, 0) + 1
    return summary


def _expired_items(inv_payload: list[dict]) -> list[str]:
    from service.urgency import run_urgency_ranking
    _, expired = run_urgency_ranking(inv_payload)
    return expired
