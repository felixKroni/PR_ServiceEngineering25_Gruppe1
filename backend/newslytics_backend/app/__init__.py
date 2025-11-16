from flask import Flask, jsonify
from .config import Config
from .models import db  # nur db hier, Modelle später importieren


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    # Tabellen anlegen (für erste Tests ausreichend;
    # in echten Projekten eher Flask-Migrate benutzen)
    with app.app_context():
        from . import models  # noqa: F401
        db.create_all()

    @app.route("/")
    def index():
        return jsonify({"message": "Flask Portfolio API is running"})

    # API-Routen
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
