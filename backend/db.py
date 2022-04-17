import sqlite3
from os.path import join, dirname

from flask import current_app, g


DATA_DIR = join(dirname(__file__), 'data')


def get_db():
    if 'db' not in g:
        db_path = join(DATA_DIR, current_app.config['DB_NAME'])
        g.db = sqlite3.connect(db_path)

    return g.db


def close_db(e=None):
    db = g.pop('db', None)
    if db:
        db.close()


def init_app(app):
    app.teardown_appcontext(close_db)
