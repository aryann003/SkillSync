import pytest
from django.contrib.auth.models import User


@pytest.mark.django_db
class TestAuth:
    def test_register_creates_user(self, client):
        resp = client.post(
            "/api/register/",
            {"username": "newbie", "email": "n@example.com", "password": "StrongPass123!"},
            format="json",
        )
        assert resp.status_code == 201
        user = User.objects.get(username="newbie")
        # password must be hashed, never stored in plain text
        assert user.password != "StrongPass123!"
        assert user.check_password("StrongPass123!")

    def test_register_rejects_duplicate_username(self, client, user):
        resp = client.post(
            "/api/register/",
            {"username": user.username, "email": "x@example.com", "password": "StrongPass123!"},
            format="json",
        )
        assert resp.status_code == 400

    def test_register_requires_password(self, client):
        resp = client.post("/api/register/", {"username": "nopass", "email": "a@b.com"}, format="json")
        assert resp.status_code == 400

    def test_login_returns_jwt_pair(self, client, user):
        resp = client.post(
            "/api/login/", {"username": "alice", "password": "StrongPass123!"}, format="json"
        )
        assert resp.status_code == 200
        assert {"access", "refresh"} <= set(resp.data)

    def test_login_wrong_password_rejected(self, client, user):
        resp = client.post("/api/login/", {"username": "alice", "password": "wrong"}, format="json")
        assert resp.status_code == 401

    def test_access_token_unlocks_protected_endpoint(self, client, user):
        token = client.post(
            "/api/login/", {"username": "alice", "password": "StrongPass123!"}, format="json"
        ).data["access"]
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        assert client.get("/api/profile/").status_code == 200

    def test_refresh_token_issues_new_access_token(self, client, user):
        refresh = client.post(
            "/api/login/", {"username": "alice", "password": "StrongPass123!"}, format="json"
        ).data["refresh"]
        resp = client.post("/api/refresh/", {"refresh": refresh}, format="json")
        assert resp.status_code == 200 and "access" in resp.data

    @pytest.mark.parametrize(
        "method,url",
        [
            ("get", "/api/profile/"),
            ("get", "/api/posts/"),
            ("post", "/api/posts/create/"),
            ("get", "/api/notifications/"),
            ("get", "/api/communities/"),
            ("get", "/api/reports/my/"),
            ("get", "/api/connections/blocked-users/"),
        ],
    )
    def test_protected_endpoints_reject_anonymous(self, client, method, url):
        assert getattr(client, method)(url).status_code == 401

    def test_garbage_token_rejected(self, client):
        client.credentials(HTTP_AUTHORIZATION="Bearer not.a.token")
        assert client.get("/api/posts/").status_code == 401


@pytest.mark.django_db
class TestProfile:
    def test_update_profile(self, auth_client):
        resp = auth_client.patch(
            "/api/profile/update/",
            {"bio": "Backend dev", "skills": "python,django"},
            format="json",
        )
        assert resp.status_code == 200
        assert auth_client.get("/api/profile/").data["skills"] == "python,django"
