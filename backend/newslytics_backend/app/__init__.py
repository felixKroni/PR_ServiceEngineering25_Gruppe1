from flask import Flask, jsonify
from .config import Config
from .models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    with app.app_context():
        from . import models
        db.create_all()

    @app.route("/")
    def index():
        return jsonify({"message": "Flask Portfolio API is running"})

    # API-Routen
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
