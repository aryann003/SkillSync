import pytest

from communities.models import Community, CommunityMember, CommunityPost
from notifications.models import Notification


@pytest.fixture
def community(user):
    c = Community.objects.create(name="Pythonistas", description="py", created_by=user)
    CommunityMember.objects.create(user=user, community=c)
    return c


@pytest.mark.django_db
class TestCommunities:
    def test_create_makes_creator_a_member(self, auth_client, user):
        resp = auth_client.post("/api/communities/create/", {"name": "DjangoDevs", "description": "d"}, format="json")
        assert resp.status_code == 201
        c = Community.objects.get(name="DjangoDevs")
        assert CommunityMember.objects.filter(user=user, community=c).exists()

    def test_create_requires_name(self, auth_client):
        assert auth_client.post("/api/communities/create/", {"name": " "}, format="json").status_code == 400

    def test_duplicate_name_rejected(self, auth_client, community):
        assert auth_client.post("/api/communities/create/", {"name": "Pythonistas"}, format="json").status_code == 400

    def test_join_notifies_creator(self, other_client, community, user):
        assert other_client.post(f"/api/communities/join/{community.id}/").status_code == 201
        assert Notification.objects.get().user == user

    def test_join_twice_rejected(self, other_client, community):
        other_client.post(f"/api/communities/join/{community.id}/")
        assert other_client.post(f"/api/communities/join/{community.id}/").status_code == 400
        assert community.members.count() == 2

    def test_leave(self, other_client, other_user, community):
        CommunityMember.objects.create(user=other_user, community=community)
        assert other_client.delete(f"/api/communities/leave/{community.id}/").status_code == 200
        assert community.members.count() == 1

    def test_join_missing_community_404(self, auth_client):
        assert auth_client.post("/api/communities/join/9999/").status_code == 404

    def test_member_can_post_to_community(self, auth_client, community):
        resp = auth_client.post(
            f"/api/communities/{community.id}/posts/create/", {"title": "Hi", "content": "all"}, format="json"
        )
        assert resp.status_code == 201
        assert CommunityPost.objects.count() == 1

    def test_non_member_cannot_post(self, other_client, community):
        resp = other_client.post(
            f"/api/communities/{community.id}/posts/create/", {"title": "Hi", "content": "all"}, format="json"
        )
        assert resp.status_code in (400, 403)
        assert CommunityPost.objects.count() == 0

    def test_search_communities(self, auth_client, community):
        resp = auth_client.get("/api/communities/search/?q=pyth")
        assert resp.status_code == 200
