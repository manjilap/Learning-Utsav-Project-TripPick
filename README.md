# Agentic AI Travel Assistant — Trip Pick

This repository contains a React (Vite) frontend and a Django backend that together implement an agentic travel assistant (planner) capable of orchestrating small specialized agents (flight/hotel/weather/activities/packing/CO2/food culture), returning itinerary suggestions, and persisting user itineraries.

This README is a concise developer guide. See `backend/README.md` and `trip_planner frontend/README.md` for folder-specific setup notes.

Quick overview
- Frontend: `trip_planner frontend/` — React + Vite app that provides the CreateTrip UI, authentication pages, and itinerary display.
- Backend: `backend/` — Django REST API (accounts app + planner app). Planner contains agent modules and an orchestrator that composes itineraries.
- DB: SQLite for local development (file: `backend/db.sqlite3`).

Ports and endpoints (defaults)
- Frontend dev server: http://localhost:5173
- Django dev server: http://127.0.0.1:8000
- Planner endpoints (examples):
  - POST /api/planner/generate/  -> generate itinerary from preferences
  - POST /api/planner/save/      -> save itinerary for authenticated user
  - GET  /api/planner/history/<user_id>/ -> list saved itineraries for user

Environment
- Backend environment variables go in `backend/.env` (or system env). A small template was added at `backend/.env`.
- Frontend env variables go in `trip_planner frontend/.env.example`. Copy it to `.env` in that folder and update values.

Developer quick start (Windows PowerShell)

1) Backend

```powershell
cd backend
python -m venv .venv
. .venv\Scripts\Activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

2) Frontend (in a new terminal)

```powershell
cd "trip_planner frontend"
npm install
copy .env.example .env  # then edit .env if needed
npm run dev
```

Notes & troubleshooting
- If you get CORS errors, ensure `http://localhost:5173` is included in `backend/backend/settings.py` `CORS_ALLOWED_ORIGINS` (already added).
- If `manage.py` complains about missing environment variables, check `backend/.env`. For local dev some keys are optional and the settings provide safe fallbacks.
- If the frontend cannot reach the backend, confirm `VITE_API_BASE` in frontend `.env` points to `http://127.0.0.1:8000/api/planner/` (or appropriate hostname/port).

Where to go next
- To replace mocked agent implementations with real API adapters, inspect `backend/planner/agents/*` and implement the live adapters for the services you want (e.g., Amadeus, Open-Meteo, Foursquare).
- Tests and CI are not currently present. Adding a small Django test and a React test would be a good next step.

Contributing
- Please follow the code style already present: small, focused commits and add/update tests when changing behavior.
