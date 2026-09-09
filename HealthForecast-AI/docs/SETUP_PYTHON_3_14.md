# HealthForecast-AI — Python 3.14 setup

1. Install CPython 3.14.x (64-bit) and enable **Add python.exe to PATH**.
2. Open the project root in VS Code.
3. In PowerShell run:

```powershell
py -3.14 -m venv .venv
.venv\Scripts\activate
python --version
python backend/check_python.py
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

4. Start the API:

```powershell
uvicorn backend.app.main:app --reload
```

If using the `backend` directory as the working directory instead:

```powershell
cd backend
uvicorn app.main:app --reload
```

5. In a second terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Use the seeded accounts from the main README.
