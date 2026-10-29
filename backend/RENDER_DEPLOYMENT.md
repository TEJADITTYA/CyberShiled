# Cyber Shield — Deploy Flask backend to Render

## Step 1 — Upload the project to GitHub
1. Extract this ZIP.
2. Create a GitHub repository and push the project files.
3. Keep `render.yaml` at the repository root. Do not upload real secrets or `.env` files.

## Step 2 — Deploy
1. Sign in at https://render.com/
2. Choose New + → Blueprint and connect the GitHub repository containing `render.yaml`.
3. Review the `cyber-shield-api` service and deploy.
4. Copy the public HTTPS URL assigned by Render.

If deploying manually, set Root Directory to `Cyber-Shield-Organized/backend`, Runtime to Python, Build Command to `pip install -r requirements.txt`, Start Command to `gunicorn app:app`, and Health Check Path to `/api/health`.

## Step 3 — Test
Open `https://YOUR-SERVICE.onrender.com/api/health` and `https://YOUR-SERVICE.onrender.com/`. Replace the example hostname with your actual Render hostname. The health endpoint should return JSON with status `ok`.

## Important
- Free Render services can sleep after inactivity, making the first request slower.
- The current backend uses rule-based/demo signatures. Some IP/location and threat-feed fields are illustrative, not verified live intelligence. Do not treat results as guaranteed protection.
- The current mobile `App.tsx` uses local message-analysis logic and does not yet call the Flask scan endpoints. After deployment, the mobile app must be updated to use the actual HTTPS URL for `/api/scan/message`, `/api/scan/url`, and other endpoints.
- The backend currently enables wildcard CORS for `/api/*`; restrict origins for production if browser access is needed. Add request limits and monitoring before public launch.
- Never put private API keys or server secrets in the mobile app. Real system-wide SMS monitoring requires Android-native implementation, permissions, and policy review.

After deployment, save the real Render URL and share it here to continue mobile integration. Never send passwords or secret keys.
