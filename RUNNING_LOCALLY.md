# Running in VS Code (no Docker needed)

This is the fastest path — tested exactly as written below. You need two
terminals in VS Code (Terminal → Split Terminal), one for the backend, one
for the frontend.

## 1. Open the project

Unzip `healthforecast-ai.zip` and open the `healthforecast-ai` folder in
VS Code (`File → Open Folder`).

## 2. Backend (Terminal 1)

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv

# macOS / Linux:
source venv/bin/activate
# Windows (PowerShell):
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create the database tables + a default admin login
python -m app.db.seed

# Start the API
uvicorn app.main:app --reload --port 8000
```

You should see `Uvicorn running on http://0.0.0.0:8000`. Leave this
terminal running. Open **http://localhost:8000/api/docs** in a browser —
if you see the Swagger UI, the backend is working.

No database setup needed — it defaults to a local SQLite file
(`backend/dev.db`) that gets created automatically. (Docker Compose still
uses real Postgres for anything closer to production.)

Default login seeded above: `admin@healthforecast.ai` / `ChangeMe123!`

## 3. Frontend (Terminal 2 — open a new one, keep Terminal 1 running)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** — you should land on the login page. Sign
in with the admin credentials above.

## Troubleshooting

- **`python3: command not found`** (Windows) — use `python` instead of `python3`.
- **`pip install` fails on a package** — make sure you're using Python 3.11
  or 3.12 (`python3 --version`). Older versions may not have wheels for
  some dependencies.
- **Frontend shows a blank page / network error on login** — confirm
  Terminal 1 (backend) is still running and showing no errors, and that
  `http://localhost:8000/api/health` returns `{"status":"ok",...}` in a
  browser.
- **Port already in use** — something else is on 8000 or 3000. Stop it, or
  run the backend on a different port (`--port 8001`) and set
  `NEXT_PUBLIC_API_URL=http://localhost:8001` before `npm run dev`.
- **Want a fresh database** — stop the backend, delete `backend/dev.db`,
  re-run `python -m app.db.seed`.

## Once this works

Switching to Docker Compose later (for something closer to the real
deployment target, with Postgres) is just `docker compose up --build` from
the project root — see the main `README.md`.
