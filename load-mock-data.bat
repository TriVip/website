@echo off
REM Script để load mock data cho Rare Parfume trên Windows
REM Chạy script này sau khi đã setup database

echo 🚀 Loading Mock Data for Rare Parfume...

REM Kiểm tra kết nối database
echo 📊 Checking database connection...
psql -h localhost -U rareparfume_user -d rareparfume_db -c "SELECT version();" >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ Database connection successful
) else (
    echo ❌ Database connection failed. Please check your database setup.
    pause
    exit /b 1
)

REM Load schema nếu chưa có
echo 📋 Loading database schema...
psql -h localhost -U rareparfume_user -d rareparfume_db -f schema.sql

if %errorlevel% equ 0 (
    echo ✅ Schema loaded successfully
) else (
    echo ❌ Schema loading failed
    pause
    exit /b 1
)

REM Load mock data
echo 🎭 Loading product mock data...
psql -h localhost -U rareparfume_user -d rareparfume_db -f mock-data.sql

if %errorlevel% equ 0 (
    echo ✅ Product mock data loaded successfully
) else (
    echo ❌ Product mock data loading failed
    pause
    exit /b 1
)

REM Load blog mock data
echo 📝 Loading blog mock data...
psql -h localhost -U rareparfume_user -d rareparfume_db -f blog-mock-data.sql

if %errorlevel% equ 0 (
    echo ✅ Blog mock data loaded successfully
) else (
    echo ❌ Blog mock data loading failed
    pause
    exit /b 1
)

REM Load additional sample data
echo 📦 Loading additional sample data...
psql -h localhost -U rareparfume_user -d rareparfume_db -f enhanced-sample-data.sql

if %errorlevel% equ 0 (
    echo ✅ Additional sample data loaded successfully
) else (
    echo ❌ Additional sample data loading failed
    pause
    exit /b 1
)

REM Hiển thị thống kê
echo 📊 Database Statistics:
psql -h localhost -U rareparfume_user -d rareparfume_db -c "SELECT 'Products' as table_name, COUNT(*) as count FROM products UNION ALL SELECT 'Orders' as table_name, COUNT(*) as count FROM orders UNION ALL SELECT 'Order Items' as table_name, COUNT(*) as count FROM order_items UNION ALL SELECT 'Blog Posts' as table_name, COUNT(*) as count FROM blog_posts;"

echo.
echo 🎉 Mock data loading completed successfully!
echo.
echo 📋 Summary:
echo    - 25+ premium niche perfumes from top brands
echo    - 5 detailed blog posts about perfumes
echo    - 7 sample orders with different statuses
echo    - Complete product details with scent notes
echo.
echo 🔗 You can now start the application and explore the data!
pause
