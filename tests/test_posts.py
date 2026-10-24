import pytest

from notifications.models import Notification
from posts.models import Comment, Like, Post, SavedPost


@pytest.mark.django_db
class TestPostCrud:
    def test_create_post(self, auth_client, user):
        resp = auth_client.post("/api/posts/create/", {"title": "T", "content": "C"}, format="json")
        assert resp.status_code == 201
        assert Post.objects.get().user == user

    @pytest.mark.parametrize("payload", [{"title": "", "content": "c"}, {"title": "t", "content": "  "}, {}])
    def test_create_post_validation(self, auth_client, payload):
        assert auth_client.post("/api/posts/create/", payload, format="json").status_code == 400

    def test_list_posts_is_paginated(self, auth_client, user):
        Post.objects.bulk_create([Post(user=user, title=f"t{i}", content="c") for i in range(8)])
        resp = auth_client.get("/api/posts/")
        assert resp.data["count"] == 8
        assert len(resp.data["results"]) == 6
        assert resp.data["next"] is not None

    def test_owner_can_update_post(self, auth_client, post):
        resp = auth_client.patch(f"/api/posts/update/{post.id}/", {"title": "New"}, format="json")
        assert resp.status_code == 200
        post.refresh_from_db()
        assert post.title == "New"

    def test_cannot_update_someone_elses_post(self, other_client, post):
        resp = other_client.patch(f"/api/posts/update/{post.id}/", {"title": "Hacked"}, format="json")
        assert resp.status_code == 404
        post.refresh_from_db()
        assert post.title == "Hello"

    def test_cannot_delete_someone_elses_post(self, other_client, post):
        assert other_client.delete(f"/api/posts/delete/{post.id}/").status_code == 404
        assert Post.objects.filter(id=post.id).exists()

    def test_owner_can_delete_post(self, auth_client, post):
        assert auth_client.delete(f"/api/posts/delete/{post.id}/").status_code == 200
        assert not Post.objects.filter(id=post.id).exists()

    def test_my_posts_only_returns_own(self, auth_client, other_user, user, post):
        Post.objects.create(user=other_user, title="theirs", content="c")
        resp = auth_client.get("/api/posts/my/")
        assert [p["id"] for p in resp.data["results"]] == [post.id]


@pytest.mark.django_db
class TestLikes:
    def test_like_post_and_counts(self, other_client, post):
        assert other_client.post(f"/api/posts/like/{post.id}/").status_code == 201
        resp = other_client.get("/api/posts/")
        item = resp.data["results"][0]
        assert item["likes_count"] == 1
        assert item["is_liked"] is True

    def test_like_is_idempotent(self, other_client, post):
        other_client.post(f"/api/posts/like/{post.id}/")
        resp = other_client.post(f"/api/posts/like/{post.id}/")
        assert resp.status_code == 200
        assert Like.objects.count() == 1

    def test_like_creates_notification_for_author(self, other_client, post, user):
        other_client.post(f"/api/posts/like/{post.id}/")
        n = Notification.objects.get()
        assert n.user == user and n.notification_type == "like"

    def test_no_notification_for_liking_own_post(self, auth_client, post):
        auth_client.post(f"/api/posts/like/{post.id}/")
        assert Notification.objects.count() == 0

    def test_unlike(self, other_client, post):
        other_client.post(f"/api/posts/like/{post.id}/")
        assert other_client.delete(f"/api/posts/unlike/{post.id}/").status_code == 200
        assert Like.objects.count() == 0

    def test_like_missing_post_404(self, auth_client):
        assert auth_client.post("/api/posts/like/9999/").status_code == 404


@pytest.mark.django_db
class TestComments:
    def test_comment_notifies_post_author(self, other_client, post, user):
        resp = other_client.post(f"/api/posts/comment/{post.id}/", {"content": "nice"}, format="json")
        assert resp.status_code == 201
        assert Notification.objects.get().user == user

    def test_reply_notifies_comment_author(self, auth_client, other_client, post, other_user):
        parent = Comment.objects.create(user=other_user, post=post, content="hi")
        auth_client.post(f"/api/posts/comment/{post.id}/", {"content": "reply", "parent": parent.id}, format="json")
        n = Notification.objects.get()
        assert n.user == other_user and "replied" in n.message

    def test_empty_comment_rejected(self, auth_client, post):
        assert auth_client.post(f"/api/posts/comment/{post.id}/", {"content": " "}, format="json").status_code == 400

    def test_reply_to_comment_on_other_post_rejected(self, auth_client, post, user):
        other_post = Post.objects.create(user=user, title="x", content="y")
        foreign = Comment.objects.create(user=user, post=other_post, content="c")
        resp = auth_client.post(
            f"/api/posts/comment/{post.id}/", {"content": "r", "parent": foreign.id}, format="json"
        )
        assert resp.status_code == 404

    def test_comments_are_nested(self, auth_client, post, user):
        parent = Comment.objects.create(user=user, post=post, content="p")
        Comment.objects.create(user=user, post=post, parent=parent, content="child")
        data = auth_client.get(f"/api/posts/comments/{post.id}/").data
        assert len(data) == 1 and len(data[0]["replies"]) == 1

    def test_only_author_can_edit_comment(self, other_client, post, user):
        c = Comment.objects.create(user=user, post=post, content="mine")
        assert other_client.patch(f"/api/posts/comment/update/{c.id}/", {"content": "x"}, format="json").status_code == 404

    def test_post_owner_can_delete_any_comment_on_their_post(self, auth_client, post, other_user):
        c = Comment.objects.create(user=other_user, post=post, content="spam")
        assert auth_client.delete(f"/api/posts/comment/delete/{c.id}/").status_code == 200

    def test_stranger_cannot_delete_comment(self, make_user, post, other_user):
        from rest_framework.test import APIClient
        stranger = make_user("carol")
        c = Comment.objects.create(user=other_user, post=post, content="x")
        client = APIClient(); client.force_authenticate(user=stranger)
        assert client.delete(f"/api/posts/comment/delete/{c.id}/").status_code == 403


@pytest.mark.django_db
class TestSavedAndTrending:
    def test_save_and_list_saved(self, other_client, post):
        assert other_client.post(f"/api/posts/save/{post.id}/").status_code == 201
        assert other_client.post(f"/api/posts/save/{post.id}/").status_code == 200  # idempotent
        assert len(other_client.get("/api/posts/saved/").data) == 1

    def test_unsave(self, other_client, post):
        other_client.post(f"/api/posts/save/{post.id}/")
        assert other_client.delete(f"/api/posts/unsave/{post.id}/").status_code == 200
        assert SavedPost.objects.count() == 0

    def test_trending_ranking_is_not_distorted_by_join_multiplication(self, auth_client, make_user, user):
        """Regression: Count('like') and Count('comment') in one query multiplied each other.

        'balanced' has 3 likes + 3 comments (inflated to 9 by the old query) while
        'liked' has 5 likes + 0 comments. By real likes, 'liked' must rank first.
        """
        people = [make_user(f"p{i}") for i in range(5)]
        liked = Post.objects.create(user=user, title="liked", content="c")
        balanced = Post.objects.create(user=user, title="balanced", content="c")
        for u in people:
            Like.objects.create(user=u, post=liked)
        for u in people[:3]:
            Like.objects.create(user=u, post=balanced)
            Comment.objects.create(user=u, post=balanced, content="x")
        results = auth_client.get("/api/posts/trending/").data["results"]
        assert [p["title"] for p in results[:2]] == ["liked", "balanced"]
        assert results[1]["likes_count"] == 3 and results[1]["comments_count"] == 3

    def test_trending_orders_by_likes(self, auth_client, make_user, user):
        quiet = Post.objects.create(user=user, title="quiet", content="c")
        hot = Post.objects.create(user=user, title="hot", content="c")
        Like.objects.create(user=make_user("l1"), post=hot)
        Like.objects.create(user=make_user("l2"), post=hot)
        Like.objects.create(user=make_user("l3"), post=quiet)
        titles = [p["title"] for p in auth_client.get("/api/posts/trending/").data["results"]]
        assert titles[:2] == ["hot", "quiet"]
