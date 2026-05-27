# SkillSync

SkillSync is a social learning platform built with Django REST Framework. It allows users to connect with people who share similar learning goals, skills, interests, and professional journeys.

The project focuses on building a complete backend system with authentication, profiles, posts, likes, comments, follow system, communities, search, recommendations, validation, permissions, and a basic frontend demo.

---

## Features

### Authentication

- User registration
- JWT-based login
- Access and refresh token support
- Protected API routes

### User Profiles

- Automatic profile creation after registration
- View logged-in user's profile
- Update bio, skills, interests, and profession

### Posts

- Create posts
- View all posts
- View logged-in user's posts
- Update own posts
- Delete own posts

### Likes and Comments

- Like and unlike posts
- Prevent duplicate likes
- Add comments on posts
- View all comments of a post
- Like count and comment count in post response

### Connections

- Follow users
- Unfollow users
- View followers list
- View following list
- Prevent self-follow
- Prevent duplicate follow records

### Communities

- Create communities
- Automatically join created community
- View all communities
- Join and leave communities
- View community members
- Create posts inside communities
- Restrict community posting to members only

### Search and Recommendations

- Search users by username, bio, skills, interests, or profession
- Search communities by name or description
- Recommend users based on interests, skills, and profession
- Recommend communities based on user profile data

### Validation and Permissions

- Required field validation
- Empty input handling
- JWT protected routes
- Ownership checks for update/delete operations
- Proper HTTP status codes
- Error handling for invalid requests

### Frontend Demo

- Basic frontend using HTML, CSS, and JavaScript
- Register and login from frontend
- Create posts from frontend
- Create communities from frontend
- Search users from frontend
- JWT access token stored in localStorage

---

## Tech Stack

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- SQLite

### Frontend

- HTML
- CSS
- JavaScript

### Tools

- Postman
- Git
- GitHub

---

## Project Structure

```text
SkillSync/
│
├── skillsync/              # Main project configuration
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── users/                  # Authentication and profile APIs
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── signals.py
│
├── posts/                  # Posts, likes, and comments
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── connections/            # Follow and unfollow system
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── communities/            # Communities and community posts
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── frontend/               # Basic frontend demo
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── manage.py
├── requirements.txt
├── .gitignore
└── README.md
```

---

## API Documentation

### Authentication APIs

| Method | Endpoint              | Description              | Auth Required |
| ------ | --------------------- | ------------------------ | ------------- |
| POST   | `/api/register/`      | Register a new user      | No            |
| POST   | `/api/token/`         | Login and get JWT tokens | No            |
| POST   | `/api/token/refresh/` | Refresh access token     | No            |

---

### Profile APIs

| Method | Endpoint               | Description                     | Auth Required |
| ------ | ---------------------- | ------------------------------- | ------------- |
| GET    | `/api/profile/`        | Get logged-in user's profile    | Yes           |
| PATCH  | `/api/profile/update/` | Update logged-in user's profile | Yes           |

---

### Post APIs

| Method | Endpoint                  | Description                 | Auth Required |
| ------ | ------------------------- | --------------------------- | ------------- |
| POST   | `/api/posts/create/`      | Create a post               | Yes           |
| GET    | `/api/posts/`             | View all posts              | Yes           |
| GET    | `/api/posts/my/`          | View logged-in user's posts | Yes           |
| PATCH  | `/api/posts/update/<id>/` | Update own post             | Yes           |
| DELETE | `/api/posts/delete/<id>/` | Delete own post             | Yes           |

---

### Like and Comment APIs

| Method | Endpoint                    | Description             | Auth Required |
| ------ | --------------------------- | ----------------------- | ------------- |
| POST   | `/api/posts/like/<id>/`     | Like a post             | Yes           |
| DELETE | `/api/posts/unlike/<id>/`   | Unlike a post           | Yes           |
| POST   | `/api/posts/comment/<id>/`  | Add comment on a post   | Yes           |
| GET    | `/api/posts/comments/<id>/` | View comments of a post | Yes           |

---

### Connection APIs

| Method | Endpoint                           | Description                | Auth Required |
| ------ | ---------------------------------- | -------------------------- | ------------- |
| POST   | `/api/connections/follow/<id>/`    | Follow a user              | Yes           |
| DELETE | `/api/connections/unfollow/<id>/`  | Unfollow a user            | Yes           |
| GET    | `/api/connections/followers/<id>/` | View user's followers      | Yes           |
| GET    | `/api/connections/following/<id>/` | View user's following list | Yes           |

---

### Community APIs

| Method | Endpoint                              | Description                  | Auth Required |
| ------ | ------------------------------------- | ---------------------------- | ------------- |
| POST   | `/api/communities/create/`            | Create a community           | Yes           |
| GET    | `/api/communities/`                   | View all communities         | Yes           |
| GET    | `/api/communities/<id>/`              | View community detail        | Yes           |
| POST   | `/api/communities/join/<id>/`         | Join a community             | Yes           |
| DELETE | `/api/communities/leave/<id>/`        | Leave a community            | Yes           |
| GET    | `/api/communities/members/<id>/`      | View community members       | Yes           |
| POST   | `/api/communities/<id>/posts/create/` | Create post inside community | Yes           |
| GET    | `/api/communities/<id>/posts/`        | View community posts         | Yes           |
| DELETE | `/api/communities/posts/delete/<id>/` | Delete own community post    | Yes           |

---

### Search and Recommendation APIs

| Method | Endpoint                             | Description           | Auth Required |
| ------ | ------------------------------------ | --------------------- | ------------- |
| GET    | `/api/search/users/?q=<query>`       | Search users          | Yes           |
| GET    | `/api/recommend/users/`              | Recommend users       | Yes           |
| GET    | `/api/communities/search/?q=<query>` | Search communities    | Yes           |
| GET    | `/api/communities/recommend/`        | Recommend communities | Yes           |

---

## Authentication

SkillSync uses JWT authentication.

After login, the backend returns an access token and a refresh token.

Example login response:

```json
{
  "refresh": "refresh_token_here",
  "access": "access_token_here"
}
```

For protected routes, the access token must be sent in the request header:

```text
Authorization: Bearer <access_token>
```

The backend verifies the token and identifies the logged-in user using `request.user`.

---

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-link>
cd SkillSync
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

For Windows:

```bash
venv\Scripts\activate
```

For Linux/Mac:

```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create superuser

```bash
python manage.py createsuperuser
```

### 7. Start development server

```bash
python manage.py runserver
```

Backend will run at:

```text
http://127.0.0.1:8000/
```

---

## Frontend Setup

Open the frontend file directly in browser:

```text
frontend/index.html
```

Make sure the Django backend server is running before using the frontend.

The frontend connects to:

```text
http://127.0.0.1:8000/api/
```

---

## Environment Notes

This project currently uses SQLite for local development.

For production, the project can be upgraded to:

- PostgreSQL
- Environment variables
- Cloud deployment
- Production-ready static file handling
- Secure CORS settings

---

## Testing

The APIs were tested using Postman and a basic frontend demo.

### Tested Cases

- User registration
- JWT login
- Accessing protected routes with token
- Accessing protected routes without token
- Profile update
- Post creation
- Post update by owner
- Post delete by owner
- Prevent another user from updating/deleting a post
- Like a post
- Prevent duplicate likes
- Unlike a post
- Add comment
- Prevent empty comments
- Follow another user
- Prevent self-follow
- Prevent duplicate follow
- Unfollow user
- Create community
- Join community
- Prevent duplicate community join
- Create community post as member
- Prevent community post without joining
- Search users
- Search communities
- Validate empty search query

---

## Important Validations

The project includes validation for:

- Empty post title
- Empty post content
- Empty comment content
- Empty community name
- Empty search query
- Invalid object IDs
- Duplicate likes
- Duplicate follows
- Duplicate community joins
- Unauthorized access
- Ownership-based update/delete operations

---

## Key Backend Concepts Used

- Django apps
- Django ORM
- Model relationships
- OneToOneField
- ForeignKey
- Serializers
- SerializerMethodField
- Function-based API views
- JWT authentication
- DRF permissions
- Query parameters
- Q objects for search
- Case-insensitive filtering using `icontains`
- Validation
- Error handling
- HTTP status codes
- Modular backend architecture

---

## Screenshots

Add your screenshots inside a `screenshots/` folder.

Example:

```text
screenshots/
├── frontend-home.png
├── login-response.png
├── post-created.png
├── community-created.png
└── postman-api-test.png
```

Then update this section:

```md
### Frontend Demo

![Frontend Demo](screenshots/frontend-home.png)

### Post Created

![Post Created](screenshots/post-created.png)

### JWT Login

![JWT Login](screenshots/login-response.png)
```

---

## Future Improvements

- React frontend
- Better UI design
- Notifications
- Saved posts
- Real-time chat
- Profile image upload
- Post image/video upload
- Community admin and moderator roles
- Report and block system
- Advanced recommendation algorithm
- Pagination
- API rate limiting
- Backend deployment
- Frontend deployment

---

## Author

Aryan Katiyar
