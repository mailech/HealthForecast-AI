@echo off
echo ===================================================
echo  HealthForecast AI - One-Click Launcher
echo ===================================================
echo Starting Backend & Frontend services in separate windows...

start "HealthForecast AI Backend" cmd /k "%~dp0run_backend.bat"
start "HealthForecast AI Frontend" cmd /k "%~dp0run_frontend.bat"
