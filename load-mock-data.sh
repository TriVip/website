#!/bin/bash

# Script để load mock data cho Rare Parfume
# Chạy script này sau khi đã setup database

echo "🚀 Loading Mock Data for Rare Parfume..."

# Kiểm tra kết nối database
echo "📊 Checking database connection..."
psql -h localhost -U rareparfume_user -d rareparfume_db -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check your database setup."
    exit 1
fi

# Load schema nếu chưa có
echo "📋 Loading database schema..."
psql -h localhost -U rareparfume_user -d rareparfume_db -f schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema loaded successfully"
else
    echo "❌ Schema loading failed"
    exit 1
fi

# Load mock data
echo "🎭 Loading product mock data..."
psql -h localhost -U rareparfume_user -d rareparfume_db -f mock-data.sql

if [ $? -eq 0 ]; then
    echo "✅ Product mock data loaded successfully"
else
    echo "❌ Product mock data loading failed"
    exit 1
fi

# Load blog mock data
echo "📝 Loading blog mock data..."
psql -h localhost -U rareparfume_user -d rareparfume_db -f blog-mock-data.sql

if [ $? -eq 0 ]; then
    echo "✅ Blog mock data loaded successfully"
else
    echo "❌ Blog mock data loading failed"
    exit 1
fi

# Load additional sample data
echo "📦 Loading additional sample data..."
psql -h localhost -U rareparfume_user -d rareparfume_db -f enhanced-sample-data.sql

if [ $? -eq 0 ]; then
    echo "✅ Additional sample data loaded successfully"
else
    echo "❌ Additional sample data loading failed"
    exit 1
fi

# Hiển thị thống kê
echo "📊 Database Statistics:"
psql -h localhost -U rareparfume_user -d rareparfume_db -c "
SELECT 
    'Products' as table_name,
    COUNT(*) as count
FROM products
UNION ALL
SELECT 
    'Orders' as table_name,
    COUNT(*) as count
FROM orders
UNION ALL
SELECT 
    'Order Items' as table_name,
    COUNT(*) as count
FROM order_items
UNION ALL
SELECT 
    'Blog Posts' as table_name,
    COUNT(*) as count
FROM blog_posts;
"

echo ""
echo "🎉 Mock data loading completed successfully!"
echo ""
echo "📋 Summary:"
echo "   - 25+ premium niche perfumes from top brands"
echo "   - 5 detailed blog posts about perfumes"
echo "   - 7 sample orders with different statuses"
echo "   - Complete product details with scent notes"
echo ""
echo "🔗 You can now start the application and explore the data!"
