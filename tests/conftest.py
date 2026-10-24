import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from posts.models import Post, Comment, Like
from users.models import Profile


@pytest.fixture
def make_user(db):
    def _make(username="user", password="StrongPass123!", **extra):
        user = User.objects.create_user(
            username=username,
            email=f"{username}@example.com",
            password=password,
            **extra,
        )
        Profile.objects.get_or_create(user=user)
        return user

    return _make


@pytest.fixture
def user(make_user):
    return make_user("alice")


@pytest.fixture
def other_user(make_user):
    return make_user("bob")


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def auth_client(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


@pytest.fixture
def other_client(other_user):
    c = APIClient()
    c.force_authenticate(user=other_user)
    return c


@pytest.fixture
def post(user):
    return Post.objects.create(user=user, title="Hello", content="First post")


@pytest.fixture
def populate_feed(make_user):
    """Create n posts, each with likes and comments, to expose N+1 queries."""

    def _populate(n=10):
        author = make_user("author")
        fans = [make_user(f"fan{i}") for i in range(3)]
        for i in range(n):
            p = Post.objects.create(user=author, title=f"t{i}", content="c")
            for f in fans:
                Like.objects.create(user=f, post=p)
                Comment.objects.create(user=f, post=p, content="nice")
        return author

    return _populate


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    """DRF throttling state lives in the cache; isolate tests from each other."""
    from django.core.cache import cache

    cache.clear()
