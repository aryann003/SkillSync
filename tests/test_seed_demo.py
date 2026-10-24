import pytest
from django.contrib.auth.models import User
from django.core.management import call_command

from communities.models import Community
from posts.models import Comment, Like, Post


@pytest.mark.django_db
def test_seed_demo_creates_data():
    call_command("seed_demo")
    assert User.objects.filter(username="demo").exists()
    assert Post.objects.count() >= 5
    assert Community.objects.count() == 3


@pytest.mark.django_db
def test_seed_demo_is_idempotent():
    call_command("seed_demo")
    counts = (User.objects.count(), Post.objects.count(), Comment.objects.count(), Like.objects.count())
    call_command("seed_demo")
    assert counts == (User.objects.count(), Post.objects.count(), Comment.objects.count(), Like.objects.count())


@pytest.mark.django_db
def test_demo_user_can_log_in(client):
    call_command("seed_demo")
    resp = client.post("/api/login/", {"username": "demo", "password": "DemoPass123!"}, format="json")
    assert resp.status_code == 200
