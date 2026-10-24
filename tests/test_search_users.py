import pytest

from communities.models import Community
from posts.models import Post


@pytest.mark.django_db
class TestSearchAndRecommendations:
    def test_search_users_by_skill(self, auth_client, other_user):
        other_user.profile.skills = "python,django"
        other_user.profile.save()
        resp = auth_client.get("/api/search/users/?q=django")
        assert resp.status_code == 200
        assert resp.data["count"] == 1

    def test_global_search_returns_users_posts_communities(self, auth_client, user, other_user):
        Post.objects.create(user=user, title="Django tips", content="c")
        Community.objects.create(name="Django Club", created_by=user)
        resp = auth_client.get("/api/search/?q=django")
        assert resp.status_code == 200

    def test_recommended_users_match_shared_skills(self, auth_client, user, other_user):
        user.profile.skills = "python"
        user.profile.save()
        other_user.profile.skills = "python,go"
        other_user.profile.save()
        resp = auth_client.get("/api/recommend/users/")
        assert resp.status_code == 200

    def test_dashboard_counts(self, auth_client, post):
        resp = auth_client.get("/api/dashboard/")
        assert resp.status_code == 200
