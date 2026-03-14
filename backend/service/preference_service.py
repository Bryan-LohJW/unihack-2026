from mongo_collection.repository.preference_repository import PreferenceRepository
from mongo_collection.schema.preference_schema import PreferenceSchema


class PreferenceService:
    def __init__(self, db):
        self.repo = PreferenceRepository(db)

    def get_preference(self) -> dict:
        """Get the current preference. Returns defaults if none exists."""
        doc = self.repo.find_one()
        schema = PreferenceSchema.from_db(doc)
        return schema.to_document()

    def update_preference(self, data: dict) -> dict:
        """Update preferences. Accepts default_serving, cuisine, dietary"""
        doc = self.repo.update(data)
        return PreferenceSchema.from_db(doc).to_document()

    def delete_preference(self) -> bool:
        """Delete the preference document. Returns True if deleted."""
        return self.repo.delete()
