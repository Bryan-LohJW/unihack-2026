from enum import Enum

class DeleteReason(Enum):
    CONSUMED = "consumed"
    WASTED = "wasted"

class Section(Enum):
    PANTRY = "pantry"
    FRIDGE = "fridge"
    FREEZER = "freezer"
    