<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Services\CheckoutPricingService;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(private readonly CheckoutPricingService $pricing) {}

    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $coupons = Coupon::query()
            ->where('status', true)
            ->where(function ($q) use ($userId) {
                $q->whereNull('per_user_limit')->orWhereRaw(
                    '(SELECT COUNT(*) FROM coupon_user_usages cuu_user WHERE cuu_user.coupon_id = coupons.id AND cuu_user.user_id = ?) < per_user_limit',
                    [$userId]
                );
            })
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->where(fn ($q) => $q->whereNull('end_date')->orWhere('end_date', '>', now()))
            ->where(function ($q) {
                $q->whereNull('usage_limit')->orWhereRaw(
                    'used_count + (SELECT COUNT(*) FROM coupon_user_usages cuu WHERE cuu.coupon_id = coupons.id AND cuu.status = ?) < usage_limit',
                    ['reserved']
                );
            })->latest()->get()->map(function ($coupon) {
                $coupon->type = $coupon->discount_type === 'shipping' ? 'shipping' : 'product';
                return $coupon;
            });

        return response()->json(['success' => true, 'data' => $coupons]);
    }

    public function apply(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:255'],
            'shipping_method' => ['nullable', 'in:economy,standard,express'],
            'province' => ['nullable', 'string', 'max:100'],
            'product_coupon_id' => ['nullable', 'integer'],
            'shipping_coupon_id' => ['nullable', 'integer'],
        ]);

        $coupon = Coupon::whereRaw('UPPER(code) = ?', [mb_strtoupper(trim($data['code']))])->first();
        if (!$coupon) return response()->json(['success' => false, 'message' => 'Mã giảm giá không tồn tại!'], 404);

        $isShipping = $coupon->discount_type === 'shipping';
        try {
            $quote = $this->pricing->quote(
                $request->user(), $data['shipping_method'] ?? 'economy',
                $isShipping ? ($data['product_coupon_id'] ?? null) : $coupon->id,
                $isShipping ? $coupon->id : ($data['shipping_coupon_id'] ?? null),
                $data['province'] ?? null
            );
            unset($quote['items'], $quote['product_coupon'], $quote['shipping_coupon']);
            return response()->json([
                'success' => true,
                'message' => 'Áp dụng voucher thành công!',
                'data' => [
                    ...$coupon->toArray(),
                    'type' => $isShipping ? 'shipping' : 'product',
                    'discount_amount' => $isShipping ? $quote['shipping_discount'] : $quote['discount_amount'],
                ],
                'quote' => $quote,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }
}
