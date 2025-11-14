@echo off
REM Script để xóa tất cả mock data từ database SQLite

echo 🗑️  Deleting all mock data from database...
echo.

cd backend
node delete-mock-data.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Mock data deletion completed successfully!
) else (
    echo.
    echo ❌ Failed to delete mock data
    pause
    exit /b 1
)

pause

