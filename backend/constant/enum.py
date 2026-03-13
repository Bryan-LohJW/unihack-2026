from enum import Enum

class DeleteReason(Enum):
    CONSUMED = "Consumed"
    WASTED = "Wasted"

class Section(Enum):
    PANTRY = "Pantry"
    FRIDGE = "Fridge"
    FREEZER = "Freezer"
    