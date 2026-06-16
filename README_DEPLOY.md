Deployment guide

This repository contains a React client (`/client`) and an Express backend (`/server`) using PostgreSQL.

Requirements
- A managed PostgreSQL instance (Supabase, Render Postgres, Railway, etc.)
- Set the `DATABASE_URL` environment variable for the database connection
- Set `JWT_SECRET` for auth tokens
- (Optional) `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` for Vercel deploy via CI

Quick deploy options

1) Docker (recommended for single-host deployments)
- Build the image locally:

```bash
docker build -t highschool-system:latest .
```

- Run with env vars:

```bash
docker run -e DATABASE_URL="$DATABASE_URL" -e JWT_SECRET="$JWT_SECRET" -p 5000:5000 highschool-system:latest
```

2) Vercel (frontend) + managed backend (Render/Supabase)
- Connect this repo to Vercel for the frontend; set `REACT_APP_API_URL` to your backend URL.
- For backend, deploy `server` to Render/Heroku as a Node service. Add `DATABASE_URL` and `JWT_SECRET` secrets.
- CI workflow `.github/workflows/deploy.yml` will run DB migrations and seed when `DATABASE_URL` is set in repository secrets.

3) Heroku / Render
- Create app, set `Procfile` in repo root (`web: node server/index.js`).
- Set env vars `DATABASE_URL` and `JWT_SECRET`.
- Deploy from GitHub; run migrations manually once or rely on the CI job to run them.

Environment variables
- `DATABASE_URL` — Postgres connection string (required for production)
- `JWT_SECRET` — secret used to sign JWT tokens (recommended long random string)
- `REACT_APP_API_URL` — frontend should point to API base URL in production
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — only if you want CI to trigger Vercel deployment

CI
- The provided GitHub Actions workflow `.github/workflows/deploy.yml` will:
  - Install dependencies
  - Run `node server/db-init.js` and `node server/seed.js` when `DATABASE_URL` is set
  - Build the frontend
  - Optionally call Vercel to deploy if `VERCEL_TOKEN` is configured

Notes
- After deploying backend, ensure the frontend's `REACT_APP_API_URL` is set to the backend URL so API requests route correctly.
- You may remove the legacy `server/data/db.js` and `server/routes/misc.js` after verifying everything is working.
