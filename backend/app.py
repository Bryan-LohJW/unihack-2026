from asyncio.log import logger
import os
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from router.inventory_router import init_inventory_routes as init_inventory, inventory_bp
from router.health_router import init_health_routes, health_bp
from router.kitchen_karma_router import init_kitchen_karma_routes, kitchen_karma_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

mongo_uri = os.getenv("MONGO_URI", "").strip()
if not mongo_uri:
    raise RuntimeError(
        "MONGO_URI is not set. Create backend/.env with MONGO_URI=<your mongodb uri>."
    )

client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
db = client["fridge_db"]

# Register blueprints / routers
init_health_routes(client)
app.register_blueprint(health_bp)

init_inventory(db)
app.register_blueprint(inventory_bp)

init_kitchen_karma_routes(db)
app.register_blueprint(kitchen_karma_bp)


if __name__ == "__main__":
    app.run(debug=True, port=5001)
