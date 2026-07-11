# SkillSync

SkillSync is a Django REST Framework API with a React frontend in `skillsync-frontend`.

## Deploying on Render

### Blueprint deployment

This repository includes `render.yaml`, which defines:

- a Render PostgreSQL database named `skillsync-db`;
- a Python web service named `skillsync-api`;
- branch `master`;
- build command `bash build.sh`;
- start command `gunicorn skillsync.wsgi:application`;
- generated `SECRET_KEY`;
- `DEBUG=False`;
- `DATABASE_URL` connected from the Render database.

To deploy:

1. Push the repository to GitHub.
2. In Render, choose **Blueprints**.
3. Select this repository.
4. Confirm the resources from `render.yaml`.
5. Deploy.

### Manual Render settings

If creating the backend manually:

- Runtime: `Python`
- Branch: `master`
- Build Command:

```bash
bash build.sh
```

- Start Command:

```bash
gunicorn skillsync.wsgi:application
```

Required environment variables:

```env
SECRET_KEY=<secure-render-secret>
DEBUG=False
DATABASE_URL=<render-postgres-connection-string>
CORS_ALLOW_ALL_ORIGINS=False
ALLOWED_HOSTS=<your-backend-host>
CORS_ALLOWED_ORIGINS=<your-exact-frontend-origin>
CSRF_TRUSTED_ORIGINS=<your-exact-frontend-origin>
```

Render also provides `RENDER_EXTERNAL_HOSTNAME`; the Django settings automatically add it to `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`.

### Common production commands

Create a superuser through the Render Shell:

```bash
python manage.py createsuperuser
```

Run migrations manually if needed:

```bash
python manage.py migrate
```

### Media uploads

Profile and post images currently use local file storage. Render's standard filesystem is ephemeral, so uploaded media can be lost after deploys or restarts. For permanent post and profile images, use Cloudinary, S3, or a Render persistent disk later.

### Frontend CORS

After the frontend is deployed, set `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to the exact deployed frontend origin, for example:

```env
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
CSRF_TRUSTED_ORIGINS=https://your-frontend.onrender.com
```

Do not include trailing paths such as `/api/`.
