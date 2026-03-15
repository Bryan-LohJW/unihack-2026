"""
Hardcoded kitchen karma points per unit.
(consumed_per_unit, wasted_per_unit) — wasted is applied as negative.
Weight/volume: rate per gram or ml. Count units: points per item.
"""
# (consumed points per unit, wasted points per unit)
# Mirrors AddItemModal units: g, kg, ml, l, pcs, bottle, serving, can
# For g/ml: points per 1 g or 1 ml (e.g. 0.1 = 10 pts per 100g)
# For kg/l: points per 1 kg or 1 l
# For pcs/bottle/serving/can: points per 1 item
KARMA_PER_UNIT = {
    "g": (0.1, 0.2),       # 100g consumed = +10, wasted = -20
    "kg": (100, 200),      # 1 kg = +100 / -200
    "ml": (0.1, 0.2),      # 100 ml = +10 / -20
    "l": (100, 200),       # 1 l = +100 / -200
    "pcs": (10, 20),       # 1 piece = +10 / -20
    "bottle": (10, 20),
    "serving": (10, 20),
    "can": (10, 20),
}
DEFAULT_KARMA = (10, 20)  # unknown unit: treat as 1 item


def compute_karma_delta(amount: int | float, unit: str, is_consumed: bool) -> int:
    """Return karma points: positive for consumed, negative for wasted."""
    amount = max(0, float(amount))
    if amount <= 0:
        return 0
    unit = (unit or "g").strip().lower() or "g"
    consumed_per, wasted_per = KARMA_PER_UNIT.get(unit, DEFAULT_KARMA)
    rate = consumed_per if is_consumed else wasted_per
    points = int(round(amount * rate))
    # Ensure any consumption gives at least 1 point (avoids +0 for small amounts)
    if is_consumed and points < 1:
        points = 1
    elif not is_consumed and points < 1:
        points = 1  # wasted: -1 minimum
    return points if is_consumed else -points
