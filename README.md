# Cyber Shield

## Project structure

```text
Cyber-Shield/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── backend/           # Python Flask backend
    ├── app.py
    ├── requirements.txt
    └── .env.example
```

## Run the frontend

Open a terminal in `frontend`:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3001
```

Build/check the frontend:

```powershell
npm run build
npm run lint
```

## Run the Python backend

Open a second terminal in `backend`:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend:

```text
http://127.0.0.1:5000
```

Health check:

```text
http://127.0.0.1:5000/api/health
```

The Vite development server proxies `/api` requests to the Flask backend on port 5000.

## Important

The existing React/TypeScript application source files and Flask application logic have been kept unchanged. Only the project structure and frontend build configuration were separated so the frontend can be installed and run using npm from the `frontend` folder.


## Mobile app (Expo Go)

The `mobile/` folder contains the React Native / Expo Go mobile version. See `mobile/README.md`.
