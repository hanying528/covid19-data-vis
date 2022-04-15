from flask import Flask
from flask_cors import CORS

from . import db


def create_app(config=None):
    config = config if config else {'DB_NAME': 'covid_db.sqlite'}
    flask_app = Flask(__name__)
    CORS(flask_app)

    flask_app.config.from_mapping(config)

    db.init_app(flask_app)

    from backend.app import bp
    flask_app.register_blueprint(bp)

    return flask_app
