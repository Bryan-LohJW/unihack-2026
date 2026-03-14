from asyncio.log import logger
import os
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from router.inventory_router import init_inventory_routes as init_inventory, inventory_bp
from router.health_router import init_health_routes, health_bp
from router.kitchen_karma_router import (
    init_kitchen_karma_routes,
    kitchen_karma_bp,
)
from router.llm_router import init_llm_routes, llm_bp
from router.cron_router import init_cron_routes, cron_bp
from router.notifications_router import init_notifications_routes, notifications_bp
from router.recipe_router import init_recipe_routes, recipe_bp
from router.recipe_router_2 import recipe_bp_2
from db import mongo
from router.recipe_suggestion_router import (
    init_recipe_suggestion_routes,
    recipe_suggestion_bp,
)
from router.helper_router import init_helper_routes, helper_bp

load_dotenv()

app = Flask(__name__)
_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,https://localhost:5173").strip()
_cors_list = [o.strip() for o in _cors_origins.split(",") if o.strip()]
CORS(app, origins=_cors_list, supports_credentials=True)

mongo_uri = os.getenv("MONGO_URI", "").strip()
if not mongo_uri:
    raise RuntimeError(
        "MONGO_URI is not set. Create backend/.env with MONGO_URI=<your mongodb uri>."
    )

client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
db = client[os.getenv("MONGO_DB_NAME", "fridge_db")]
app.db = db

# Initialise shared mongo module so all modules can `from db import mongo`
mongo.init_db(app)

# Create indexes for events collection
from util.logger import ensure_event_indexes
ensure_event_indexes()

# Register blueprints / routers
init_health_routes(client)
app.register_blueprint(health_bp)

init_inventory(db)
app.register_blueprint(inventory_bp)

init_kitchen_karma_routes(db)
app.register_blueprint(kitchen_karma_bp)

init_llm_routes(db)
app.register_blueprint(llm_bp)

init_cron_routes(db)
app.register_blueprint(cron_bp)

init_notifications_routes(db)
app.register_blueprint(notifications_bp)

init_recipe_suggestion_routes(db)
app.register_blueprint(recipe_suggestion_bp)
init_recipe_routes(db)
app.register_blueprint(recipe_bp)

app.register_blueprint(recipe_bp_2)

init_helper_routes(db)
app.register_blueprint(helper_bp)

# Register CLI commands (flask check-expired)
from cli import register_cli_commands
register_cli_commands(app)


if __name__ == "__main__":
    # Start background scheduler only in the process that runs the app (avoid duplicate in reloader)
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        from scheduler import start_scheduler
        start_scheduler(app)
    app.run(debug=True, port=5001)
