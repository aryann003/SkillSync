import pytest

from connections.models import Block, Follow
from notifications.models import Notification


@pytest.mark.django_db
class TestFollow:
    def test_follow_creates_relation_and_notification(self, auth_client, user, other_user):
        assert auth_client.post(f"/api/connections/follow/{other_user.id}/").status_code == 201
        assert Follow.objects.filter(follower=user, following=other_user).exists()
        assert Notification.objects.get().user == other_user

    def test_follow_twice_does_not_duplicate(self, auth_client, other_user):
        auth_client.post(f"/api/connections/follow/{other_user.id}/")
        auth_client.post(f"/api/connections/follow/{other_user.id}/")
        assert Follow.objects.count() == 1

    def test_cannot_follow_self(self, auth_client, user):
        assert auth_client.post(f"/api/connections/follow/{user.id}/").status_code == 400

    def test_follow_missing_user_404(self, auth_client):
        assert auth_client.post("/api/connections/follow/9999/").status_code == 404

    def test_unfollow(self, auth_client, user, other_user):
        Follow.objects.create(follower=user, following=other_user)
        assert auth_client.delete(f"/api/connections/unfollow/{other_user.id}/").status_code == 200
        assert Follow.objects.count() == 0

    def test_followers_and_following_lists(self, auth_client, user, other_user):
        Follow.objects.create(follower=user, following=other_user)
        assert auth_client.get(f"/api/connections/following/{user.id}/").status_code == 200
        assert auth_client.get(f"/api/connections/followers/{other_user.id}/").status_code == 200


@pytest.mark.django_db
class TestBlock:
    def test_block_user(self, auth_client, user, other_user):
        assert auth_client.post(f"/api/connections/block/{other_user.id}/").status_code in (200, 201)
        assert Block.objects.filter(blocker=user, blocked=other_user).exists()

    def test_cannot_follow_user_you_blocked(self, auth_client, user, other_user):
        Block.objects.create(blocker=user, blocked=other_user)
        assert auth_client.post(f"/api/connections/follow/{other_user.id}/").status_code == 400

    def test_cannot_follow_user_who_blocked_you(self, auth_client, user, other_user):
        Block.objects.create(blocker=other_user, blocked=user)
        assert auth_client.post(f"/api/connections/follow/{other_user.id}/").status_code == 403
        assert Follow.objects.count() == 0

    def test_unblock(self, auth_client, user, other_user):
        Block.objects.create(blocker=user, blocked=other_user)
        assert auth_client.delete(f"/api/connections/unblock/{other_user.id}/").status_code == 200
        assert Block.objects.count() == 0

    def test_blocked_users_list(self, auth_client, user, other_user):
        Block.objects.create(blocker=user, blocked=other_user)
        assert auth_client.get("/api/connections/blocked-users/").status_code == 200
