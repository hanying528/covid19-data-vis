import pytest

import backend


@pytest.fixture(scope='session', autouse=True)
def client():
    flask_app = backend.create_app({
        'DB_NAME': 'test_db.sqlite3',
        'TESTING': True,
    })

    client = flask_app.test_client()
    ctx = flask_app.app_context()
    ctx.push()
    yield client
    ctx.pop()
