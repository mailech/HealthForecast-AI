@echo off
echo ===================================================================
echo Launching HealthForecast AI (Backend + 3D Frontend)
echo Infosys Internship Capstone Project
echo ===================================================================

start "HealthForecast AI Backend" cmd /k "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "HealthForecast AI Frontend" cmd /k "%~dp0run_frontend.bat"

echo.
echo Systems are launching!
echo Backend:  http://127.0.0.1:8001/docs
echo Frontend: http://localhost:5173
echo.
pause
