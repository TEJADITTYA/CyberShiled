# Cyber Shield - Full-Stack Architecture Guide

This application is built with a **React + Vite Frontend** (run via npm commands) and a **Flask Python Backend** for security analysis, URL reputation checks, and IP origin tracking.

---

## 🚀 1. Running the Frontend (via npm)

From the project root directory:

```bash
# 1. Install frontend dependencies
npm install

# 2. Run the Vite development server (port 3000)
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build
npm run preview

# 5. Type-check / Lint
npm run lint
```

The frontend will be accessible at `http://localhost:3000`.

---

## 🐍 2. Running the Flask Backend

The Flask backend is located in the `backend/` directory:

```bash
# 1. Navigate to backend directory
cd backend

# 2. (Recommended) Create and activate a Python virtual environment
python3 -m venv venv

# On Linux / macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run the Flask server
python app.py
```

The Flask backend will start on `http://127.0.0.1:5000`.

---

## 📡 3. REST API Endpoints Provided by Flask

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service information & health check |
| `GET` | `/api/health` | Status check for backend connectivity |
| `POST` | `/api/scan/url` | URL verification, DNS resolution & threat checks |
| `POST` | `/api/scan/ip` | Real-time IP geolocation, BGP ASN, and abuse check |
| `POST` | `/api/scan/message` | SMS and email phishing / scam keyword detection |
| `GET` | `/api/threats/feed` | National threat intelligence feed telemetry |

### Example cURL Request (URL Scan):
```bash
curl -X POST http://127.0.0.1:5000/api/scan/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

---

## 🔗 4. Full-Stack Proxy Configuration
In `vite.config.ts`, Vite is configured to automatically proxy `/api/*` calls from the frontend directly to the Flask backend running on port 5000:
```ts
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5000',
      changeOrigin: true
    }
  }
}
```
If the Flask backend is not running, the frontend gracefully uses its client-side security engines as a built-in fallback.
