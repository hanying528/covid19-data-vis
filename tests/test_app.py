import pytest


def test_request_example(client):
    response = client.get('/')
    assert b'Welcome :fire_emoji:' == response.data
