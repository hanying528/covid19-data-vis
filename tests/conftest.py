import pytest

import backend


@pytest.fixture(scope='session', autouse=True)
def client():
    flask_app = backend.create_app({
        'DB_NAME': 'covid_test_db.sqlite',
        'TESTING': True,
    })

    client = flask_app.test_client()
    yield client

