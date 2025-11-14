@echo off
REM Script để xóa các products có ID null từ database

echo 🔧 Fixing product IDs in database...
echo.

cd backend
node fix-product-ids.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Product ID fix completed successfully!
) else (
    echo.
    echo ❌ Failed to fix product IDs
    pause
    exit /b 1
)

pause

