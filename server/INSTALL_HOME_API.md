# Cài đặt dữ liệu động cho trang Home

## 1. Cập nhật source

Giải nén gói server và client vào thư mục gốc `Obsidian-Wear-New`.
Không giải nén vào bên trong thư mục `server` hoặc `client` vì sẽ tạo thư mục lồng.

## 2. Chạy migration

```powershell
cd C:\GitHub\Obsidian-Wear-New\server
php artisan migrate
php artisan optimize:clear
```

Migration chỉ thêm các cột merchandising vào `products` và `brands`; không xóa dữ liệu cũ.

## 3. Cấu hình dữ liệu trong Admin

Vào **Admin → Sản phẩm → Chỉnh sửa** để đặt:

- Bộ môn thể thao.
- Sản phẩm nổi bật.
- Giá khuyến mãi (phải nhỏ hơn giá bán).
- Tên chương trình khuyến mãi.
- Ngày bắt đầu và kết thúc khuyến mãi.

Vào **Admin → Thương hiệu → Chỉnh sửa** để đặt:

- Đường dẫn logo, ví dụ `/images/nike.png` hoặc URL Cloudinary.
- Hiển thị nổi bật trên trang chủ.

## 4. Kiểm tra API

Mở:

```text
http://localhost:8000/api/home
```

Trong `data` phải có:

- `newest_products`
- `best_selling_products`
- `featured_products`
- `featured_categories`
- `sport_sections`
- `deals`
- `featured_brands`

## 5. Build frontend

```powershell
cd C:\GitHub\Obsidian-Wear-New\client
npm run build
npm run dev
```

Banner vẫn dùng ảnh tĩnh `/images/banner.png`. Các phần còn lại lấy dữ liệu từ API Home.
