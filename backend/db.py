"""
Shared MongoDB connection module.

Usage:
    from db import mongo
    mongo.init_db(app)          # call once at startup
    mongo.db.<collection>       # use anywhere after init
"""

import os
from pymongo import MongoClient


class _Mongo:
    """Thin wrapper so every module can `from db import mongo` and use mongo.db."""

    def __init__(self):
        self.client = None
        self.db = None

    def init_db(self, app=None):
        """Connect to MongoDB and bind `self.db`.

        If *app* is a Flask app that already has ``app.db`` set, reuse it.
        Otherwise read ``MONGO_URI`` / ``MONGO_DB_NAME`` from env.
        """
        if app and getattr(app, "db", None) is not None:
            self.db = app.db
            return

        mongo_uri = os.getenv("MONGO_URI", "").strip()
        if not mongo_uri:
            raise RuntimeError(
                "MONGO_URI is not set. Create backend/.env with MONGO_URI=<your mongodb uri>."
            )
        db_name = os.getenv("MONGO_DB_NAME", "fridge_db")
        self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        self.db = self.client[db_name]


mongo = _Mongo()
