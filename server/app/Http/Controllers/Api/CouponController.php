<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CouponController extends Controller
{
    /**
     * API Kiểm tra và Áp dụng mã giảm giá
     */
    // API Lấy danh sách tất cả mã giảm giá đang hoạt động
    public function index()
    {
        $coupons = Coupon::where('status', 1)
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', \Carbon\Carbon::now());
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $coupons
        ], 200);
    }
    public function apply(Request $request)
    {
        // 1. Kiểm tra đầu vào từ React gửi lên
        $request->validate([
            'code' => 'required|string',
            'order_value' => 'required|numeric|min:0' // Tổng tiền tạm tính của giỏ hàng để xét điều kiện
        ]);

        $code = strtoupper($request->code);
        $orderValue = $request->order_value;

        // 2. Tìm mã giảm giá trong Database
        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá không tồn tại!'
            ], 404);
        }

        // 3. Kiểm tra trạng thái hoạt động
        if (!$coupon->status) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá này đã bị khóa!'
            ], 400);
        }

        // 4. Kiểm tra hạn sử dụng
        if ($coupon->expires_at && Carbon::now()->greaterThan($coupon->expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá đã hết hạn sử dụng!'
            ], 400);
        }

        // 5. Kiểm tra giới hạn số lượng đã dùng
        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá đã hết lượt sử dụng!'
            ], 400);
        }

        // 6. Kiểm tra giá trị đơn hàng tối thiểu
        if ($coupon->min_order_value !== null && $orderValue < $coupon->min_order_value) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này (Tối thiểu: ' . number_format($coupon->min_order_value, 0, ',', '.') . 'đ)'
            ], 400);
        }

        // 7. Nếu mọi thứ hợp lệ, trả về dữ liệu Voucher cho Frontend
        return response()->json([
            'success' => true,
            'message' => 'Áp dụng mã giảm giá thành công!',
            'data' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'discount_type' => $coupon->discount_type, // 'percent' hoặc 'fixed'
                'discount_value' => $coupon->discount_value,
                'type' => $coupon->discount_type === 'shipping' ? 'shipping' : 'product' // Quy định loại mã
            ]
        ], 200);
    }
}