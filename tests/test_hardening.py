import pytest


@pytest.mark.django_db
def test_login_is_rate_limited(client, user):
    """Brute-force protection: the 11th login attempt within a minute is throttled."""
    statuses = [
        client.post("/api/login/", {"username": "alice", "password": "wrong"}, format="json").status_code
        for _ in range(11)
    ]
    assert statuses[:10] == [401] * 10
    assert statuses[10] == 429


@pytest.mark.django_db
def test_openapi_schema_is_served(client):
    resp = client.get("/api/schema/")
    assert resp.status_code == 200
    assert b"SkillSync API" in resp.content


@pytest.mark.django_db
def test_swagger_ui_is_served(client):
    assert client.get("/api/docs/").status_code == 200


@pytest.mark.django_db
def test_paginated_search_has_stable_ordering(auth_client, make_user):
    for i in range(8):
        u = make_user(f"dev{i}")
        u.profile.skills = "python"
        u.profile.save()
    page1 = auth_client.get("/api/search/users/?q=python").data["results"]
    page2 = auth_client.get("/api/search/users/?q=python&page=2").data["results"]
    ids = [p["id"] for p in page1 + page2]
    assert len(ids) == len(set(ids)) == 8
