# SkillSync Web Client

React single-page app for the [SkillSync API](../README.md): feed, trending posts, explore, communities, notifications, saved posts, profiles, and a dashboard.

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand, React Hook Form + Zod, Axios.

## Run locally

```bash
cd skillsync-frontend
cp .env.example .env        # set VITE_API_BASE_URL (default: http://127.0.0.1:8000/api/)
npm ci
npm run dev
```

The API must be running (see the root README) and must allow this origin through `CORS_ALLOWED_ORIGINS`.

## Build

```bash
VITE_API_BASE_URL=https://your-api.example.com/api/ npm run build
```

`VITE_API_BASE_URL` is read at build time and must end with a trailing slash. The app uses browser routing, so the host must rewrite all paths to `index.html`.

## Notes

- Access and refresh tokens are handled by an Axios interceptor that refreshes on a 401 and retries queued requests.
- Routes are protected by `ProtectedRoute`, and each page is wrapped in an error boundary.
