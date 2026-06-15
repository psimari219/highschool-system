Railway deployment steps

1. Sign in to Railway (https://railway.app) and connect your GitHub account.
2. Create a new project and choose "Deploy from GitHub".
3. Select the `psimari219/highschool-system` repository and pick the `main` branch.

Backend (server):
- Point Railway to the `server` folder as the service root.
- Use the Dockerfile or let Railway run `npm install` and `npm start`.
- In Railway, add a PostgreSQL plugin and copy the generated connection variables.
- Set the following environment variables in the Railway service:
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT` (usually $PORT), `JWT_SECRET`

Frontend (client):
- Create a second service in the same Railway project for the frontend or use a separate project.
- Use the `Dockerfile.client` or run the build command: `npm run build` and serve the `build/` folder.
- Set `REACT_APP_API_URL` to the public backend URL (e.g., `https://<server>.up.railway.app/api`)

CI/CD:
- Railway will automatically deploy when you push to the selected branch.

Notes:
- Ensure `server/.env` is not committed (it is ignored).
- After deployment, update the frontend `REACT_APP_API_URL` env var with the backend URL.
- For migrations: run `npm run db:init` and `npm run db:seed` from Railway console (or include an init step in deployment).