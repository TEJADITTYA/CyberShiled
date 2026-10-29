@echo off
cd /d "%~dp0"
echo Installing Cyber Shield frontend dependencies...
npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo npm installation failed. Please make sure Node.js 20+ and internet access are available.
  pause
  exit /b 1
)
echo.
echo Installation complete. Starting Cyber Shield on http://localhost:3001
npm run dev
