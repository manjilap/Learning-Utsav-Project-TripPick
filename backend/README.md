# Backend (Django) — Trip Pick

This folder contains the Django backend for the Trip Pick project.

Quick setup (Windows PowerShell):

```powershell
# from repo root
cd backend

# create or activate virtualenv
python -m venv .venv
. .venv\Scripts\Activate

# install pinned dependencies
pip install -r requirements.txt

# create migrations for local apps (planner was recently added)
python manage.py makemigrations
python manage.py migrate

# run local server (default 127.0.0.1:8000)
python manage.py runserver
```

Notes
- The settings file reads environment variables for EMAIL and SECRET_KEY. For local development you can create a `.env` file at the project root (same folder as `manage.py`) or rely on the safe defaults in `backend/backend/settings.py`.
- API endpoints for the planner app are registered under `/api/planner/` (generate/save/history).
- If you used an earlier requirements.txt that listed `django-restframework==0.0.1`, it was incorrect; `djangorestframework` and `djangorestframework-simplejwt` are required and pinned in `requirements.txt`.

If you want, I can add a small script to automate env setup and run these commands.
