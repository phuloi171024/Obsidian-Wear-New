# Cài bản sửa server

1. Sao lưu project và database hiện tại.
2. Chép thư mục `server` trong gói này đè lên thư mục `server` của project.
3. Giữ nguyên file `.env` thật của bạn; không chép secret vào source.
4. Bổ sung vào `.env`:

```env
FRONTEND_URL=http://localhost:5173
CLOUDINARY_URL=cloudinary://YOUR_API_KEY:YOUR_API_SECRET@YOUR_CLOUD_NAME
VNP_EXPIRE_MINUTES=15
VNP_ORDER_EXPIRE_MINUTES=30
```

5. Chạy:

```powershell
composer dump-autoload
php artisan optimize:clear
php artisan migrate
php artisan route:list --path=api/vnpay -v
php artisan schedule:list
```

6. Khi chạy local, mở thêm một PowerShell:

```powershell
php artisan schedule:work
```

7. Trước deploy phải đổi Cloudinary API secret đã từng xuất hiện trong source.

Khi có hosting, cấu hình cron chạy mỗi phút:

```text
php /duong-dan-server/artisan schedule:run
```

và cập nhật `FRONTEND_URL`, `APP_URL`, `VNP_RETURN_URL`, IPN URL bằng domain HTTPS thật.
