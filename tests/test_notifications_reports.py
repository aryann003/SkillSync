import pytest
from rest_framework.test import APIClient

from notifications.models import Notification
from posts.models import Comment
from reports.models import Report


@pytest.fixture
def admin_client(make_user):
    admin = make_user("admin", is_staff=True)
    c = APIClient()
    c.force_authenticate(user=admin)
    return c


@pytest.mark.django_db
class TestNotifications:
    @pytest.fixture
    def notes(self, user, other_user):
        return [
            Notification.objects.create(user=user, sender=other_user, notification_type="like", message=f"m{i}")
            for i in range(3)
        ]

    def test_count(self, auth_client, notes):
        assert auth_client.get("/api/notifications/count/").data == {"unread_count": 3, "total_count": 3}

    def test_mark_one_as_read(self, auth_client, notes):
        assert auth_client.patch(f"/api/notifications/read/{notes[0].id}/").status_code == 200
        assert auth_client.get("/api/notifications/unread/").data.__len__() == 2

    def test_mark_all_as_read(self, auth_client, notes):
        auth_client.patch("/api/notifications/read/all/")
        assert auth_client.get("/api/notifications/count/").data["unread_count"] == 0

    def test_cannot_read_or_delete_others_notifications(self, other_client, notes):
        assert other_client.patch(f"/api/notifications/read/{notes[0].id}/").status_code == 404
        assert other_client.delete(f"/api/notifications/delete/{notes[0].id}/").status_code == 404
        assert Notification.objects.filter(id=notes[0].id).exists()

    def test_listing_only_returns_own(self, other_client, notes):
        assert other_client.get("/api/notifications/").data == []

    def test_delete_own(self, auth_client, notes):
        assert auth_client.delete(f"/api/notifications/delete/{notes[0].id}/").status_code == 200


@pytest.mark.django_db
class TestReports:
    def test_report_post(self, other_client, post):
        resp = other_client.post(f"/api/reports/post/{post.id}/", {"reason": "spam", "description": "d"}, format="json")
        assert resp.status_code == 201
        assert Report.objects.count() == 1

    def test_cannot_report_own_post(self, auth_client, post):
        assert auth_client.post(f"/api/reports/post/{post.id}/", {"reason": "spam"}, format="json").status_code == 400

    def test_cannot_report_same_post_twice(self, other_client, post):
        other_client.post(f"/api/reports/post/{post.id}/", {"reason": "spam"}, format="json")
        assert other_client.post(f"/api/reports/post/{post.id}/", {"reason": "spam"}, format="json").status_code == 400

    def test_invalid_reason_rejected(self, other_client, post):
        assert other_client.post(f"/api/reports/post/{post.id}/", {"reason": "bogus"}, format="json").status_code == 400

    def test_report_comment(self, other_client, post, user):
        c = Comment.objects.create(user=user, post=post, content="rude")
        assert other_client.post(f"/api/reports/comment/{c.id}/", {"reason": "abuse"}, format="json").status_code == 201

    @pytest.mark.parametrize("url", ["/api/reports/all/", "/api/reports/pending/"])
    def test_moderation_lists_are_staff_only(self, auth_client, admin_client, url):
        assert auth_client.get(url).status_code == 403
        assert admin_client.get(url).status_code == 200

    def test_only_staff_can_update_status(self, auth_client, admin_client, other_client, post):
        other_client.post(f"/api/reports/post/{post.id}/", {"reason": "spam"}, format="json")
        report = Report.objects.get()
        assert auth_client.patch(f"/api/reports/status/{report.id}/", {"status": "resolved"}, format="json").status_code == 403
        assert admin_client.patch(f"/api/reports/status/{report.id}/", {"status": "resolved"}, format="json").status_code == 200
        report.refresh_from_db()
        assert report.status == "resolved"

    def test_invalid_status_rejected(self, admin_client, other_client, post):
        other_client.post(f"/api/reports/post/{post.id}/", {"reason": "spam"}, format="json")
        report = Report.objects.get()
        assert admin_client.patch(f"/api/reports/status/{report.id}/", {"status": "nope"}, format="json").status_code == 400
