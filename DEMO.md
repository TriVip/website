# 🎬 Hướng dẫn Demo Dự án Rare Parfume

## 🚀 Cách chạy Demo nhanh

### Windows:
1. Double-click vào file `demo.bat`
2. Đợi các services khởi động (khoảng 10-30 giây)
3. Mở trình duyệt và truy cập:
   - **Website bán hàng**: http://localhost:3000
   - **Admin Panel**: http://localhost:3001

### Hoặc chạy thủ công:

#### Terminal 1 - Backend:
```bash
cd backend
npm install
npm start
```

#### Terminal 2 - Frontend Website:
```bash
cd frontend
npm install
npm start
```

#### Terminal 3 - Admin Panel:
```bash
cd frontend/admin
npm install
set PORT=3001
npm start
```

## 🔐 Thông tin đăng nhập

### Admin Panel:
- **Email**: `admin@rareparfume.com`
- **Password**: `admin123`
- **Role**: Admin (toàn quyền)

## 📱 Các tính năng để Demo

### 1. Website Bán Hàng (http://localhost:3000)

#### Trang chủ:
- ✅ Hero banner với hiệu ứng parallax
- ✅ Sản phẩm nổi bật
- ✅ Câu chuyện thương hiệu
- ✅ Blog teaser
- ✅ Newsletter subscription

#### Trang Sản phẩm:
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Chi tiết sản phẩm với gallery ảnh
- ✅ Thông tin tầng hương (Top, Middle, Base notes)
- ✅ Thêm vào giỏ hàng

#### Giỏ hàng & Thanh toán:
- ✅ Xem giỏ hàng
- ✅ Cập nhật số lượng
- ✅ Thanh toán qua QR Code
- ✅ Xác nhận đơn hàng

#### Blog:
- ✅ Xem danh sách bài viết
- ✅ Đọc chi tiết bài viết

### 2. Admin Panel (http://localhost:3001)

#### Dashboard:
- ✅ Thống kê tổng quan:
  - Tổng sản phẩm
  - Tổng đơn hàng
  - Tổng doanh thu
  - Thống kê feedback
  - Thống kê blog
  - Top khách hàng

#### Quản lý Đơn hàng:
- ✅ Xem tất cả đơn hàng
- ✅ Lọc theo trạng thái
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Xem chi tiết đơn hàng

#### Quản lý Sản phẩm:
- ✅ Xem danh sách sản phẩm
- ✅ Thêm sản phẩm mới
- ✅ Sửa thông tin sản phẩm
- ✅ Xóa sản phẩm
- ✅ Quản lý hình ảnh
- ✅ Quản lý tầng hương

#### Quản lý Khách hàng:
- ✅ Xem danh sách khách hàng
- ✅ Xem chi tiết khách hàng
- ✅ Xem lịch sử đơn hàng
- ✅ Xem feedback của khách hàng
- ✅ Cập nhật thông tin khách hàng
- ✅ Quản lý VIP status
- ✅ Thêm tags và notes

#### Quản lý Feedback:
- ✅ Xem tất cả feedback
- ✅ Lọc theo trạng thái
- ✅ Cập nhật trạng thái feedback
- ✅ Thêm admin notes
- ✅ Quản lý follow-up dates

#### Quản lý Blog:
- ✅ Xem danh sách bài viết
- ✅ Tạo bài viết mới
- ✅ Sửa bài viết
- ✅ Xóa bài viết
- ✅ Quản lý trạng thái publish/draft

## 🔒 Phân quyền

### Role: Admin
- ✅ Toàn quyền truy cập tất cả tính năng
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý đơn hàng (Xem & Sửa)
- ✅ Quản lý khách hàng
- ✅ Quản lý feedback
- ✅ Quản lý blog
- ✅ Xem dashboard

### Role: Sale
- ✅ Chỉ xem đơn hàng
- ❌ Không thể sửa đơn hàng
- ❌ Không thể quản lý sản phẩm
- ❌ Không thể quản lý khách hàng
- ❌ Không thể quản lý feedback
- ❌ Không thể quản lý blog
- ❌ Không thể xem dashboard

## 🎯 Demo Flow đề xuất

### 1. Demo Website Bán Hàng (5 phút)
1. Mở http://localhost:3000
2. Xem trang chủ, scroll xuống xem các section
3. Vào trang Sản phẩm, tìm kiếm và lọc
4. Xem chi tiết một sản phẩm
5. Thêm vào giỏ hàng
6. Thanh toán và tạo đơn hàng

### 2. Demo Admin Panel - Quản lý Đơn hàng (3 phút)
1. Mở http://localhost:3001
2. Đăng nhập với admin@rareparfume.com / admin123
3. Xem Dashboard với thống kê
4. Vào Orders, xem danh sách đơn hàng
5. Cập nhật trạng thái một đơn hàng

### 3. Demo Admin Panel - Quản lý Sản phẩm (3 phút)
1. Vào Products
2. Xem danh sách sản phẩm
3. Tạo sản phẩm mới
4. Sửa thông tin sản phẩm
5. Xóa sản phẩm (nếu cần)

### 4. Demo Admin Panel - Quản lý Khách hàng (2 phút)
1. Vào Customers
2. Xem danh sách khách hàng
3. Xem chi tiết một khách hàng
4. Cập nhật thông tin khách hàng

### 5. Demo Phân quyền (2 phút)
1. Tạo user với role "sale" (nếu có)
2. Đăng nhập với role sale
3. Chứng minh chỉ có thể xem đơn hàng
4. Chứng minh không thể truy cập Products, Customers, etc.

## 🐛 Troubleshooting

### Backend không khởi động:
- Kiểm tra port 5000 có đang được sử dụng không
- Kiểm tra file `.env` trong thư mục `backend`
- Kiểm tra database file `backend/database/rare_parfume.db` có tồn tại không

### Frontend không khởi động:
- Kiểm tra port 3000 có đang được sử dụng không
- Chạy `npm install` lại trong thư mục `frontend`

### Admin Panel không khởi động:
- Kiểm tra port 3001 có đang được sử dụng không
- Chạy `npm install` lại trong thư mục `frontend/admin`

### Lỗi CORS:
- Đảm bảo backend đã khởi động trước frontend
- Kiểm tra `ALLOWED_ORIGINS` trong file `.env` của backend

### Không đăng nhập được:
- Kiểm tra backend đã khởi động chưa
- Kiểm tra database có user admin không
- Chạy script tạo admin user: `node backend/create-admin-user.js`

## 📞 API Endpoints để test

### Health Check:
```
GET http://localhost:5000/api/health
```

### Products:
```
GET http://localhost:5000/api/products
GET http://localhost:5000/api/products/:id
```

### Orders:
```
POST http://localhost:5000/api/orders
GET http://localhost:5000/api/orders/:orderNumber
```

### Admin:
```
POST http://localhost:5000/api/admin/login
GET http://localhost:5000/api/admin/dashboard
GET http://localhost:5000/api/admin/orders
GET http://localhost:5000/api/admin/products
```

## 🎨 Tính năng UI/UX nổi bật

- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Smooth animations với Framer Motion
- ✅ Modern UI với Tailwind CSS
- ✅ Dark/Light mode ready
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Toast notifications

---

**Chúc bạn demo thành công! 🚀**

