# Cài bản client đã ghép

Bản này dùng `client(2)` làm nền và chỉ ghép giao diện Home mới từ `client1`.
Các phần reset password, VNPay, API URL tập trung và xử lý 401 được giữ lại.

1. Sao lưu thư mục `client/src` hiện tại.
2. Chép nội dung thư mục `client` trong gói này đè lên thư mục `client` của project.
3. Tạo hoặc kiểm tra `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

4. Chạy:

```powershell
npm run build
npm run dev
```

File `public/.htaccess` dùng cho Apache/cPanel và `public/_redirects` dùng cho host hỗ trợ quy tắc redirects để React Router không lỗi 404 khi tải lại trang.
