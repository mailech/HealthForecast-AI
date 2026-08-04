@echo off
echo ===================================================
echo  HealthForecast AI - Frontend Starter
echo ===================================================
cd /d "%~dp0frontend"

if not exist node_modules (
    echo [!] Installing Node dependencies...
    call npm install
)

echo [+] Launching Vite Development Server...
call npm run dev
