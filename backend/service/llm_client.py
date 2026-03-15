import logging
from dotenv import load_dotenv
from ai_models.receipt_scanner_2 import parse_image_to_inventory_items as _parse_receipt_v2

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
