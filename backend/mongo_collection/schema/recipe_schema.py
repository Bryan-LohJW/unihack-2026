class RecipeSchema:
    def __init__(self, menu: str, ingredients: list[str]):
        self.menu = menu
        self.ingredients = list(ingredients or [])

    @staticmethod
    def from_request(data: dict) -> "RecipeSchema":
        data = data or {}
        return RecipeSchema(
            menu=data.get("menu"),
            ingredients=data.get("ingredients") or [],
        )

    def to_document(self) -> dict:
        return {
            "menu": self.menu,
            "ingredients": self.ingredients,
        }

