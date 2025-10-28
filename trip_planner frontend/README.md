
# Trip Planner Frontend (React + Vite)

This is the React frontend built with Vite. It communicates with the Django backend API at `/api/*`.

Quick setup (Windows PowerShell):

```powershell
# from repo root
cd "trip_planner frontend"

# install node deps
npm install

# start dev server (default 5173)
npm run dev
```

Environment
- The frontend looks for an API base URL environment variable in `VITE_API_BASE` (for example `http://127.0.0.1:8000/api/planner/`). You can create a `.env` file in the frontend folder with:

```
VITE_API_BASE="http://127.0.0.1:8000/api/planner/"
```

Notes
- If you see CORS errors when the frontend calls the backend, ensure `http://localhost:5173` is listed in `CORS_ALLOWED_ORIGINS` in `backend/backend/settings.py` (already added).
- The `CreateTrip` page posts a generate request to `POST /api/planner/generate/` and then the app displays the itinerary on `/itinerary` and can save it to `/api/planner/save/`.

If you'd like I can add a small npm script to copy `.env.example` into `.env` for quick setup.

```
