@echo off
echo ====================================================
echo Starting HealthForecast AI - FastAPI Backend Server
echo ====================================================
cd /d "%~dp0\backend"
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
pause
