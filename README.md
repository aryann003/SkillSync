# SkillSync

SkillSync is a **Django REST Framework backend API** for a social learning platform where users can connect based on their skills, interests, and profession.

The project focuses on backend API development using **Django**, **Django REST Framework**, **JWT authentication**, protected APIs, model relationships, search, recommendations, notifications, and moderation features.

---

## Project Overview

SkillSync allows users to:

* Register and log in using JWT authentication
* Create and update their profile
* Add skills, interests, profession, bio, and profile image
* Create, update, and delete posts
* Like, unlike, comment, reply, save, and unsave posts
* Follow, unfollow, block, and unblock users
* Join communities and create community posts
* Search users, posts, and communities
* Get user and community recommendations
* Receive notifications for follows, likes, comments, replies, and community joins
* Report posts or comments for moderation

---

## Tech Stack

| Area            | Technology                                                        |
| --------------- | ----------------------------------------------------------------- |
| Backend         | Python, Django, Django REST Framework                             |
| Authentication  | Simple JWT                                                        |
| Database        | SQLite for local development, DATABASE_URL support for production |
| Media Uploads   | Pillow, Django File Storage                                       |
| API Testing     | Postman                                                           |
| Deployment      | Render, Gunicorn, WhiteNoise                                      |
| CORS            | django-cors-headers                                               |
| Version Control | Git, GitHub                                                       |

---

## Main Apps

```text
users
posts
connections
communities
notifications
reports
```

### users

Handles registration, profile APIs, user search, user recommendations, dashboard counts, and global search.

### posts

Handles post creation, listing, update, delete, likes, comments, replies, saved posts, activity feed, and trending posts.

### connections

Handles follow, unfollow, followers list, following list, block, unblock, and blocked users.

### communities

Handles community creation, joining, leaving, members, community posts, community search, and community recommendations.

### notifications

Handles user notifications, unread notifications, marking notifications as read, notification count, and deletion.

### reports

Handles reporting posts/comments and admin moderation of reports.

---

## Authentication

SkillSync uses **Simple JWT** with Django REST Framework.

JWT endpoints:

```text
POST /api/token/
POST /api/token/refresh/
```

After login, the client receives an access token and refresh token. The access token is passed with protected API requests:

```http
Authorization: Bearer <access_token>
```

Most APIs are protected using DRF's `IsAuthenticated` permission.

---

## API Routes

### User APIs

```text
POST  /api/register/
GET   /api/profile/
PATCH /api/profile/update/
GET   /api/search/users/?q=<query>
GET   /api/recommend/users/
GET   /api/dashboard/
GET   /api/search/?q=<query>
```

### Post APIs

```text
POST   /api/posts/create/
GET    /api/posts/
GET    /api/posts/my/
PATCH  /api/posts/update/<id>/
DELETE /api/posts/delete/<id>/
POST   /api/posts/like/<id>/
DELETE /api/posts/unlike/<id>/
POST   /api/posts/comment/<id>/
GET    /api/posts/comments/<id>/
PATCH  /api/posts/comment/update/<id>/
DELETE /api/posts/comment/delete/<id>/
POST   /api/posts/save/<id>/
DELETE /api/posts/unsave/<id>/
GET    /api/posts/saved/
GET    /api/posts/feed/
GET    /api/posts/trending/
```

### Connection APIs

```text
POST   /api/connections/follow/<id>/
DELETE /api/connections/unfollow/<id>/
GET    /api/connections/followers/<id>/
GET    /api/connections/following/<id>/
POST   /api/connections/block/<id>/
DELETE /api/connections/unblock/<id>/
GET    /api/connections/blocked-users/
```

### Community APIs

```text
POST   /api/communities/create/
GET    /api/communities/
GET    /api/communities/<id>/
POST   /api/communities/join/<id>/
DELETE /api/communities/leave/<id>/
GET    /api/communities/members/<id>/
POST   /api/communities/<id>/posts/create/
GET    /api/communities/<id>/posts/
DELETE /api/communities/posts/delete/<id>/
GET    /api/communities/search/?q=<query>
GET    /api/communities/recommend/
```

### Notification APIs

```text
GET    /api/notifications/
GET    /api/notifications/unread/
PATCH  /api/notifications/read/<id>/
PATCH  /api/notifications/read/all/
GET    /api/notifications/count/
DELETE /api/notifications/delete/<id>/
```

### Report APIs

```text
POST  /api/reports/post/<id>/
POST  /api/reports/comment/<id>/
GET   /api/reports/my/
GET   /api/reports/all/
GET   /api/reports/pending/
PATCH /api/reports/status/<id>/
```

---

## Database Models

### Profile

Stores extra user information:

```text
user
bio
skills
interests
profession
profile_image
created_at
```

Each Django `User` has one `Profile`. A profile is automatically created using a Django signal when a new user is created.

### Post

Stores user posts:

```text
user
title
content
image
created_at
updated_at
```

### Like

Stores post likes:

```text
user
post
created_at
```

`unique_together = ('user', 'post')` prevents duplicate likes.

### Comment

Stores comments and replies:

```text
user
post
parent
content
created_at
updated_at
```

The `parent` field is a self-referencing foreign key, which allows replies to comments.

### SavedPost

Stores saved posts:

```text
user
post
created_at
```

`unique_together = ('user', 'post')` prevents duplicate saved posts.

### Follow

Stores follower-following relationships:

```text
follower
following
created_at
```

`unique_together = ('follower', 'following')` prevents duplicate follows.

### Block

Stores blocked user relationships:

```text
blocker
blocked
created_at
```

When a user blocks another user, existing follow relationships between them are removed.

### Community

Stores community details:

```text
name
description
created_by
created_at
```

### CommunityMember

Stores community membership:

```text
user
community
joined_at
```

`unique_together = ('user', 'community')` prevents duplicate community joins.

### CommunityPost

Stores posts created inside communities:

```text
user
community
title
content
created_at
updated_at
```

Users must join a community before creating a community post.

### Notification

Stores user notifications:

```text
user
sender
notification_type
message
is_read
created_at
```

Notification types include follow, like, comment, community join, and message.

### Report

Stores reports for posts and comments:

```text
reported_by
post
comment
reason
description
status
created_at
```

Report statuses include pending, reviewed, resolved, and rejected.

---

## Important Backend Logic

### Automatic Profile Creation

When a new user is created, a Django signal automatically creates a matching profile.

```python
@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
```

### User Recommendations

Recommended users are based on the logged-in user's skills, interests, and profession. The values are split into terms and matched against other profiles.

### Global Search

Global search returns results from:

```text
users
posts
communities
```

It uses Django `Q` objects and `icontains` for case-insensitive partial search.

### Trending Posts

Trending posts are ranked using Django ORM `annotate()` and `Count()` based on likes and comments.

### Duplicate Prevention

The project prevents duplicate actions using `get_or_create()` and `unique_together`, including:

* Duplicate likes
* Duplicate saved posts
* Duplicate follows
* Duplicate community joins
* Duplicate reports

### Ownership and Permission Checks

The project checks ownership before sensitive actions:

* Users can update/delete only their own posts
* Users can edit only their own comments
* Post owner or comment owner can delete comments
* Users cannot follow or block themselves
* Users cannot create community posts without joining the community
* Users cannot report their own post/comment
* Users cannot report the same content multiple times
* Only staff users can view all reports or update report status

---

## Pagination

The API uses page-number pagination with a page size of 6 for list endpoints.

```python
DEFAULT_PAGINATION_CLASS = 'rest_framework.pagination.PageNumberPagination'
PAGE_SIZE = 6
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/aryann003/SkillSync.git
cd SkillSync
```

### 2. Create virtual environment

```bash
python -m venv venv
```

### 3. Activate virtual environment

Windows PowerShell:

```bash
venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Create superuser

```bash
python manage.py createsuperuser
```

### 7. Run development server

```bash
python manage.py runserver
```

Open:

```text
http://127.0.0.1:8000/
```

---

## Environment Variables

For local development, SQLite is used by default.

For production, set environment variables:

```env
SECRET_KEY=<secure-secret-key>
DEBUG=False
DATABASE_URL=<database-url>
ALLOWED_HOSTS=<backend-host>
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=<frontend-origin>
CSRF_TRUSTED_ORIGINS=<frontend-origin>
```

---

## Deployment Notes

This repository includes Render deployment support.

Typical Render build command:

```bash
bash build.sh
```

Typical Render start command:

```bash
gunicorn skillsync.wsgi:application
```

The project supports `DATABASE_URL` using `dj-database-url`, so it can use SQLite locally and PostgreSQL in production.

---

## Media Upload Note

Profile images and post images currently use local file storage. On Render's standard filesystem, uploaded media can be lost after redeploys or restarts.

For permanent media storage, Cloudinary, AWS S3, or a Render persistent disk can be added later.

---

## Future Improvements

* Add frontend integration with deployed React app
* Add Cloudinary or S3 for permanent media uploads
* Improve recommendation scoring
* Add email verification
* Add real-time notifications using WebSockets
* Add unit tests for APIs
* Add API documentation using Swagger or DRF Spectacular

---

## Author

**Aryan Katiyar**

GitHub: [aryann003](https://github.com/aryann003)
