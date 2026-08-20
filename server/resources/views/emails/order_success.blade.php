<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Xác nhận đơn hàng</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Cảm ơn bạn đã đặt hàng!</h2>
        <p>Xin chào <strong>{{ $order->user->name ?? 'Khách hàng' }}</strong>,</p>
        <p>Đơn hàng của bạn tại <strong>Obsidian Wear</strong> đã được tiếp nhận và đang được xử lý.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        
        <p><strong>Mã đơn hàng:</strong> #{{ $order->id }}</p>
        <p><strong>Trạng thái:</strong> Chờ xử lý (Pending)</p>
        <p><strong>Tổng tiền thanh toán:</strong> <span style="color: #e11d48; font-weight: bold;">{{ number_format($order->total_amount, 0, ',', '.') }} đ</span></p>
        
        <p style="margin-top: 30px;">Nếu bạn có bất kỳ câu hỏi nào, hãy phản hồi lại email này để được hỗ trợ.</p>
        <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 40px;">© 2026 Obsidian Wear. All rights reserved.</p>
    </div>
</body>
</html>