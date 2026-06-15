Deployment instructions

1) Frontend (GitHub Pages)
- The `frontend.yml` workflow builds the React app and deploys to GitHub Pages on every push to `main`.
- After the workflow runs, your site will be available at `https://<your-username>.github.io/highschool-system/`.
- If you use a custom domain, configure it in repository Pages settings.

2) Backend (Container Image)
- The `backend.yml` workflow builds a Docker image from the `server` folder and publishes it to GitHub Container Registry (GHCR) as `ghcr.io/<owner>/highschool-system-backend:latest`.
- You can deploy that image to Railway/Render/DigitalOcean App Platform by referencing the GHCR image.

Deploying the backend on Railway (example):
- In Railway, create a new project and choose "Deploy from Docker image".
- For image, enter: `ghcr.io/<owner>/highschool-system-backend:latest` (replace `<owner>` with your GitHub user/org).
- Configure environment variables and add PostgreSQL plugin.

Deploying the backend on Render (example):
- Create a new Web Service -> Docker
- Use private registry: GitHub Container Registry
- Image: `ghcr.io/<owner>/highschool-system-backend:latest`
- Add environment variables and a managed PostgreSQL instance

Notes:
- Frontend must be configured to point `REACT_APP_API_URL` at the public backend URL (e.g., https://backend.up.railway.app/api)
- Database migrations (`npm run db:init`) and seed (`npm run db:seed`) must be run in the deployed environment once before serving (use deployment console/run command).
