<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Lấy danh sách mã giảm giá đang hoạt động.
     */
    public function index()
    {
        $now = Carbon::now();

        $coupons = Coupon::query()
            ->where('status', true)
            ->where(function ($query) use ($now) {
                $query
                    ->where(function ($q) use ($now) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', $now);
                    })
                    ->where(function ($q) use ($now) {
                        $q->whereNull('end_date')
                          ->orWhere('end_date', '>', $now);
                    });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $coupons,
        ], 200);
    }

    /**
     * Kiểm tra và áp dụng mã giảm giá.
     */
    public function apply(Request $request)
    {
        // 1. Validate dữ liệu frontend gửi lên
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:255',
            ],
            'order_value' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        $code = strtoupper(trim($validated['code']));
        $orderValue = (float) $validated['order_value'];

        // 2. Tìm coupon
        $coupon = Coupon::whereRaw(
            'UPPER(code) = ?',
            [$code]
        )->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá không tồn tại!',
            ], 404);
        }

        // 3. Kiểm tra trạng thái
        if (!$coupon->status) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá này đã bị khóa!',
            ], 400);
        }

        // 4. Kiểm tra Soft Delete
        if ($coupon->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá không còn khả dụng!',
            ], 400);
        }

        // 5. Kiểm tra hạn expires_at
        if (
            $coupon->expires_at &&
            Carbon::now()->greaterThan(
                $coupon->expires_at
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá đã hết hạn sử dụng!',
            ], 400);
        }

        // 6. Kiểm tra end_date
        if (
            $coupon->end_date &&
            Carbon::now()->greaterThan(
                $coupon->end_date
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá đã hết hạn sử dụng!',
            ], 400);
        }

        // 7. Kiểm tra usage limit
        if (
            $coupon->usage_limit !== null &&
            $coupon->used_count >= $coupon->usage_limit
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá đã hết lượt sử dụng!',
            ], 400);
        }

        // 8. Kiểm tra giá trị đơn hàng tối thiểu
        if (
            $coupon->min_order_value !== null &&
            $orderValue < (float) $coupon->min_order_value
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này. ' .
                    'Tối thiểu: ' .
                    number_format(
                        (float) $coupon->min_order_value,
                        0,
                        ',',
                        '.'
                    ) .
                    'đ',
            ], 400);
        }

        // 9. Kiểm tra loại coupon
        $allowedTypes = [
            'fixed',
            'percent',
            'shipping',
        ];

        if (
            !in_array(
                $coupon->discount_type,
                $allowedTypes,
                true
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Loại mã giảm giá không hợp lệ!',
            ], 422);
        }

        // 10. Tính thử giá trị giảm
        // Đây chỉ là giá trị để frontend hiển thị.
        // Khi tạo Order, backend phải tính lại một lần nữa.
        $discountValue = (float) $coupon->discount_value;

        if ($coupon->discount_type === 'percent') {
            $discountAmount =
                $orderValue * ($discountValue / 100);

            // Không được giảm quá giá trị đơn
            $discountAmount = min(
                $discountAmount,
                $orderValue
            );
        } elseif ($coupon->discount_type === 'fixed') {
            $discountAmount = min(
                $discountValue,
                $orderValue
            );
        } else {
            // shipping
            // Chưa trừ trực tiếp ở đây vì phí ship
            // sẽ được xác định ở bước Order.
            $discountAmount = $discountValue;
        }

        // 11. Quy định type frontend
        $type =
            $coupon->discount_type === 'shipping'
                ? 'shipping'
                : 'product';

        // 12. Trả dữ liệu cho frontend
        return response()->json([
            'success' => true,
            'message' => 'Áp dụng mã giảm giá thành công!',
            'data' => [
                'id' => $coupon->id,
                'code' => $coupon->code,

                'discount_type' =>
                    $coupon->discount_type,

                'discount_value' =>
                    (float) $coupon->discount_value,

                'discount_amount' =>
                    $discountAmount,

                'min_order_value' =>
                    (float) $coupon->min_order_value,

                'type' => $type,

                'usage_limit' =>
                    $coupon->usage_limit,

                'used_count' =>
                    $coupon->used_count,

                'expires_at' =>
                    $coupon->expires_at,

                'end_date' =>
                    $coupon->end_date,
            ],
        ], 200);
    }
}