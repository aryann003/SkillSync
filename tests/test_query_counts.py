"""Feed endpoints must use a constant number of queries, however many posts exist."""
import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APIClient


def count_queries(client, url):
    with CaptureQueriesContext(connection) as ctx:
        resp = client.get(url)
    assert resp.status_code == 200
    return len(ctx.captured_queries), resp


@pytest.mark.django_db
def test_all_posts_query_count_is_constant(populate_feed, make_user):
    populate_feed(10)
    viewer = make_user("viewer")
    c = APIClient()
    c.force_authenticate(user=viewer)

    n, resp = count_queries(c, "/api/posts/")
    assert len(resp.data["results"]) == 6  # page size
    print(f"\nQUERIES /api/posts/ (6 posts on page): {n}")
    # constant budget: auth/session + count + posts page + related data
    assert n <= 6
