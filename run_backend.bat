@echo off
echo ===================================================
echo  HealthForecast AI - Backend Starter
echo ===================================================
cd /d "%~dp0backend"

if not exist venv (
    echo [!] Creating Python Virtual Environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo [!] Installing Python dependencies...
pip install -r requirements.txt

echo [+] Launching FastAPI Uvicorn Server...
uvicorn app.main:app --reload --port 8000
