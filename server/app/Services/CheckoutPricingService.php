<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\CouponUserUsage;
use App\Models\User;
use Illuminate\Support\Collection;
use RuntimeException;

class CheckoutPricingService
{
    public const FREE_ECONOMY_THRESHOLD = 3399000;

    public function cartItems(User $user, bool $lock = false): Collection
    {
        $query = CartItem::query()
            ->where('user_id', $user->id)
            ->with('productVariant.product');

        if ($lock) {
            $query->lockForUpdate();
        }

        $items = $query->get();

        if ($items->isEmpty()) {
            throw new RuntimeException('Giỏ hàng của bạn đang trống!');
        }

        foreach ($items as $item) {
            if (!$item->productVariant?->product || !$item->productVariant->product->status) {
                throw new RuntimeException('Có sản phẩm trong giỏ không còn được bán!');
            }
        }

        return $items;
    }

    public function quote(
        User $user,
        string $shippingMethod,
        ?int $productCouponId = null,
        ?int $shippingCouponId = null,
        ?string $province = null,
        bool $lock = false
    ): array {
        $items = $this->cartItems($user, $lock);
        $subtotal = (float) $items->sum(fn ($item) =>
            (float) $item->productVariant->product->current_price * (int) $item->quantity
        );

        $shippingFee = $this->shippingFee($shippingMethod, $subtotal, $province);
        if ($shippingCouponId && $shippingFee <= 0) {
    throw new RuntimeException(
        'Đơn hàng đã được miễn phí vận chuyển, không cần dùng voucher vận chuyển.'
    );
}
        $productCoupon = $this->coupon($user, $productCouponId, 'product', $subtotal, $lock);
        $shippingCoupon = $this->coupon($user, $shippingCouponId, 'shipping', $subtotal, $lock);

        $discountAmount = $this->productDiscount($productCoupon, $subtotal);
        $shippingDiscount = $this->shippingDiscount($shippingCoupon, $shippingFee);

        return [
            'items' => $items,
            'subtotal' => round($subtotal, 2),
            'shipping_method' => $shippingMethod,
            'shipping_fee' => round($shippingFee, 2),
            'discount_amount' => round($discountAmount, 2),
            'shipping_discount' => round($shippingDiscount, 2),
            'total' => round(max(0, $subtotal + $shippingFee - $discountAmount - $shippingDiscount), 2),
            'product_coupon' => $productCoupon,
            'shipping_coupon' => $shippingCoupon,
            'free_economy_threshold' => self::FREE_ECONOMY_THRESHOLD,
        ];
    }

    private function shippingFee(string $method, float $subtotal, ?string $province): float
    {
        return match ($method) {
            'economy' => $subtotal >= self::FREE_ECONOMY_THRESHOLD ? 0 : 30000,
            'standard' => 50000,
            'express' => $this->isHoChiMinh($province)
                ? 200000
                : throw new RuntimeException('Giao hỏa tốc chỉ áp dụng tại TP.HCM.'),
            default => throw new RuntimeException('Phương thức vận chuyển không hợp lệ!'),
        };
    }

    private function coupon(
        User $user,
        ?int $couponId,
        string $kind,
        float $subtotal,
        bool $lock
    ): ?Coupon {
        if (!$couponId) return null;

        $query = Coupon::query()->whereKey($couponId);
        if ($lock) $query->lockForUpdate();
        $coupon = $query->first();

        if (!$coupon || !$coupon->status || $coupon->trashed()) {
            throw new RuntimeException('Voucher không tồn tại hoặc đã bị khóa!');
        }

        $actualKind = $coupon->discount_type === 'shipping' ? 'shipping' : 'product';
        if ($actualKind !== $kind) {
            throw new RuntimeException($kind === 'shipping'
                ? 'Vui lòng chọn voucher vận chuyển.'
                : 'Vui lòng chọn voucher giảm giá sản phẩm.');
        }

        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            throw new RuntimeException('Voucher chưa đến thời gian sử dụng!');
        }

        if (($coupon->expires_at && $coupon->expires_at->isPast()) ||
            ($coupon->end_date && $coupon->end_date->isPast())) {
            throw new RuntimeException('Voucher đã hết hạn!');
        }

        if ($subtotal < (float) ($coupon->min_order_value ?? 0)) {
            throw new RuntimeException('Đơn hàng chưa đạt giá trị tối thiểu của voucher!');
        }

        $userUsageCount = CouponUserUsage::where('user_id', $user->id)
            ->where('coupon_id', $coupon->id)
            ->count();
        if ($coupon->per_user_limit !== null && $userUsageCount >= (int) $coupon->per_user_limit) {
            throw new RuntimeException('Bạn đã dùng hết số lượt cho phép của voucher này!');
        }

        $reserved = CouponUserUsage::where('coupon_id', $coupon->id)->where('status', 'reserved')->count();
        if ($coupon->usage_limit !== null && ((int) $coupon->used_count + $reserved) >= (int) $coupon->usage_limit) {
            throw new RuntimeException('Voucher đã hết lượt sử dụng!');
        }

        return $coupon;
    }

    private function productDiscount(?Coupon $coupon, float $subtotal): float
    {
        if (!$coupon) return 0;
        $value = (float) $coupon->discount_value;
        return min($subtotal, $coupon->discount_type === 'percent'
            ? $subtotal * min($value, 100) / 100
            : $value);
    }

    private function shippingDiscount(?Coupon $coupon, float $shippingFee): float
    {
        if (!$coupon) return 0;
        $value = (float) $coupon->discount_value;
        return min($shippingFee, $value <= 0 ? $shippingFee : $value);
    }

    private function isHoChiMinh(?string $province): bool
    {
        $value = mb_strtolower(trim((string) $province));
        return str_contains($value, 'hồ chí minh') || str_contains($value, 'ho chi minh') || $value === '79';
    }
}
