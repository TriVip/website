@echo off
echo ========================================
echo   RARE PARFUME - DEMO PROJECT
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found
echo.

echo [2/4] Installing dependencies...
echo.
echo Installing Backend dependencies...
cd backend
if not exist node_modules (
    call npm install
) else (
    echo Backend dependencies already installed
)
cd ..

echo.
echo Installing Frontend dependencies...
cd frontend
if not exist node_modules (
    call npm install
) else (
    echo Frontend dependencies already installed
)
cd ..

echo.
echo Installing Admin Frontend dependencies...
cd frontend\admin
if not exist node_modules (
    call npm install
) else (
    echo Admin Frontend dependencies already installed
)
cd ..\..
echo.

echo [3/4] Checking database...
if exist backend\database\rare_parfume.db (
    echo ✓ Database file exists
) else (
    echo ⚠ Database file not found. It will be created automatically on first run.
)
echo.

echo [4/4] Starting services...
echo.
echo ========================================
echo   Starting Backend Server (Port 5000)
echo ========================================
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo ========================================
echo   Starting Frontend (Port 3000)
echo ========================================
start "Frontend Website" cmd /k "cd frontend && npm start"

timeout /t 3 /nobreak >nul

echo ========================================
echo   Starting Admin Panel (Port 3001)
echo ========================================
start "Admin Panel" cmd /k "cd frontend\admin && set PORT=3001 && npm start"

echo.
echo ========================================
echo   ✅ ALL SERVICES STARTED!
echo ========================================
echo.
echo 📱 Frontend Website: http://localhost:3000
echo 👨‍💼 Admin Panel:      http://localhost:3001
echo 🔧 Backend API:       http://localhost:5000
echo.
echo 📋 Admin Login Credentials:
echo    Email:    admin@rareparfume.com
echo    Password: admin123
echo.
echo ⚠  Note: Please wait a few seconds for all services to start
echo    Check the opened windows for any errors
echo.
echo Press any key to close this window...
pause >nul

