class RecipeSchema:
    def __init__(self, menu: str, ingredients: list[str], image_url: str | None = None):
        self.menu = menu
        self.ingredients = list(ingredients or [])
        self.image_url = image_url

    @staticmethod
    def from_request(data: dict) -> "RecipeSchema":
        data = data or {}
        return RecipeSchema(
            menu=data.get("menu"),
            ingredients=data.get("ingredients") or [],
            image_url=data.get("image_url"),
        )

    def to_document(self) -> dict:
        return {
            "menu": self.menu,
            "ingredients": self.ingredients,
            "image_url": self.image_url,
        }

