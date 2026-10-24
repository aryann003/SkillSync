"""Fill the database with realistic demo data so the live demo is not empty.

Idempotent: running it twice does not create duplicates. Demo accounts all use
the password given by DEMO_PASSWORD (default below) and are meant for public
demo use only, so never reuse that password anywhere else.
"""
import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from communities.models import Community, CommunityMember, CommunityPost
from connections.models import Follow
from posts.models import Comment, Like, Post
from users.models import Profile

DEFAULT_PASSWORD = "DemoPass123!"

PEOPLE = [
    # username, profession, skills, interests, bio
    ("demo", "Backend Developer", "python,django,postgresql", "apis,testing",
     "Demo account for recruiters. Explore the API at /api/docs/."),
    ("priya_dev", "Full-Stack Developer", "python,react,sql", "web,design",
     "Building small tools and learning in public."),
    ("rahul_data", "Data Analyst", "sql,pandas,powerbi", "analytics,python",
     "Turning messy CSVs into dashboards."),
    ("ananya_ml", "ML Engineer", "python,pytorch,mlops", "ai,python",
     "Curious about shipping ML to production."),
    ("karan_ops", "DevOps Engineer", "docker,linux,ci", "cloud,automation",
     "Containers, pipelines, and uptime."),
    ("sneha_ui", "Frontend Developer", "javascript,react,css", "design,web",
     "Accessible interfaces and tidy components."),
]

POSTS = [
    ("demo", "Why I added tests to my Django API",
     "Writing 89 tests exposed a ranking bug in my trending endpoint. "
     "Counting likes and comments in one query multiplied them through the join."),
    ("demo", "From 32 queries to 2",
     "Feed endpoints were running one query per post. Subquery annotations plus "
     "select_related brought a page of 6 posts down to 2 queries."),
    ("priya_dev", "Learning path for backend development",
     "Python, SQL, then a framework, then deployment. What would you add?"),
    ("rahul_data", "Window functions changed how I write SQL",
     "ROW_NUMBER and LAG replaced a lot of messy self-joins in my reports."),
    ("ananya_ml", "Notes on serving a model behind an API",
     "Input validation and timeouts mattered more than model accuracy in my first deployment."),
    ("karan_ops", "A minimal CI pipeline worth having",
     "Lint, run tests against a real database, build the image. Everything else can wait."),
    ("sneha_ui", "Small accessibility wins",
     "Visible focus states and real button elements fix most keyboard problems."),
]

COMMENTS = [
    ("priya_dev", 0, "The join-multiplication bug is a great catch."),
    ("rahul_data", 0, "Did you add a regression test for it?"),
    ("demo", 0, "Yes, it fails on the old query and passes on the fix."),
    ("karan_ops", 1, "Nice. Did you measure it with assertNumQueries?"),
    ("ananya_ml", 2, "I would add Docker and CI early."),
    ("demo", 2, "Good point, I did both for this project."),
    ("demo", 3, "Window functions are underrated."),
]

COMMUNITIES = [
    ("Python Backend", "Django, FastAPI, testing and deployment.", "demo",
     ["priya_dev", "rahul_data", "ananya_ml", "karan_ops"]),
    ("Data and Analytics", "SQL, dashboards and data pipelines.", "rahul_data",
     ["demo", "ananya_ml"]),
    ("Frontend Corner", "Components, CSS and accessibility.", "sneha_ui",
     ["priya_dev", "demo"]),
]


class Command(BaseCommand):
    help = "Create demo users, posts, follows, likes, comments and communities."

    @transaction.atomic
    def handle(self, *args, **options):
        password = os.environ.get("DEMO_PASSWORD", DEFAULT_PASSWORD)
        users = {}
        for username, profession, skills, interests, bio in PEOPLE:
            user, created = User.objects.get_or_create(
                username=username, defaults={"email": f"{username}@example.com"}
            )
            if created:
                user.set_password(password)
                user.save()
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.profession, profile.skills = profession, skills
            profile.interests, profile.bio = interests, bio
            profile.save()
            users[username] = user

        for a in users.values():
            for b in users.values():
                if a != b:
                    Follow.objects.get_or_create(follower=a, following=b)

        posts = []
        for username, title, content in POSTS:
            post, _ = Post.objects.get_or_create(
                user=users[username], title=title, defaults={"content": content}
            )
            posts.append(post)

        for i, post in enumerate(posts):
            for liker in list(users.values())[: 2 + (i % 4)]:
                if liker != post.user:
                    Like.objects.get_or_create(user=liker, post=post)

        for username, index, text in COMMENTS:
            Comment.objects.get_or_create(
                user=users[username], post=posts[index], content=text
            )

        for name, description, owner, members in COMMUNITIES:
            community, _ = Community.objects.get_or_create(
                name=name,
                defaults={"description": description, "created_by": users[owner]},
            )
            for username in [owner, *members]:
                CommunityMember.objects.get_or_create(
                    user=users[username], community=community
                )
            CommunityPost.objects.get_or_create(
                user=users[owner],
                community=community,
                title=f"Welcome to {name}",
                defaults={"content": "Introduce yourself and share what you are working on."},
            )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(users)} users, {len(posts)} posts, {len(COMMUNITIES)} communities."
        ))
