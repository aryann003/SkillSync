"""Reusable post querysets that avoid N+1 queries.

Counts are computed with subqueries (not joins) so that likes and comments
never multiply each other, and ``is_liked`` is a single EXISTS subquery.
"""
from django.db.models import Count, Exists, IntegerField, OuterRef, Subquery
from django.db.models.functions import Coalesce

from .models import Comment, Like


def _count_subquery(model, field="post"):
    return Coalesce(
        Subquery(
            model.objects.filter(**{field: OuterRef("pk")})
            .order_by()
            .values(field)
            .annotate(c=Count("pk"))
            .values("c"),
            output_field=IntegerField(),
        ),
        0,
    )


def with_post_stats(queryset, user=None):
    """Annotate posts with like/comment counts and whether `user` liked them."""
    qs = queryset.select_related("user", "user__profile").annotate(
        likes_total=_count_subquery(Like),
        comments_total=_count_subquery(Comment),
    )
    if user is not None and user.is_authenticated:
        qs = qs.annotate(
            liked_by_me=Exists(Like.objects.filter(post=OuterRef("pk"), user=user))
        )
    return qs
