<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUserUsage;
use App\Models\Order;
use App\Models\OrderCoupon;
use RuntimeException;

class VoucherReservationService
{
    public function reserve(Order $order, ?Coupon $product, ?Coupon $shipping, array $quote): void
    {
        foreach ([
            ['coupon' => $product, 'kind' => 'product', 'amount' => $quote['discount_amount']],
            ['coupon' => $shipping, 'kind' => 'shipping', 'amount' => $quote['shipping_discount']],
        ] as $entry) {
            /** @var Coupon|null $coupon */
            $coupon = $entry['coupon'];
            if (!$coupon) continue;

            $userUsageCount = CouponUserUsage::where('user_id', $order->user_id)
                ->where('coupon_id', $coupon->id)
                ->count();
            if ($coupon->per_user_limit !== null && $userUsageCount >= (int) $coupon->per_user_limit) {
                throw new RuntimeException('Tài khoản đã dùng hết số lượt cho phép của voucher!');
            }

            $reserved = CouponUserUsage::where('coupon_id', $coupon->id)
                ->where('status', 'reserved')
                ->count();
            if ($coupon->usage_limit !== null && ((int) $coupon->used_count + $reserved) >= (int) $coupon->usage_limit) {
                throw new RuntimeException('Voucher đã hết lượt sử dụng!');
            }

            OrderCoupon::create([
                'order_id' => $order->id,
                'coupon_id' => $coupon->id,
                'coupon_kind' => $entry['kind'],
                'code_snapshot' => $coupon->code,
                'discount_type_snapshot' => $coupon->discount_type,
                'discount_value_snapshot' => $coupon->discount_value,
                'discount_amount' => $entry['amount'],
                'status' => 'reserved',
                'reserved_at' => now(),
            ]);

            CouponUserUsage::create([
                'user_id' => $order->user_id,
                'coupon_id' => $coupon->id,
                'order_id' => $order->id,
                'status' => 'reserved',
                'reserved_at' => now(),
            ]);
        }
    }

    public function consume(Order $order): void
    {
        $reservations = $order->orderCoupons()->where('status', 'reserved')->lockForUpdate()->get();
        foreach ($reservations as $reservation) {
            $usage = CouponUserUsage::where('order_id', $order->id)
                ->where('coupon_id', $reservation->coupon_id)->lockForUpdate()->first();
            if (!$usage || $usage->status === 'used') continue;

            $reservation->update(['status' => 'used', 'used_at' => now()]);
            $usage->update(['status' => 'used', 'used_at' => now()]);

            $coupon = Coupon::withTrashed()->whereKey($reservation->coupon_id)->lockForUpdate()->first();
            if ($coupon) $coupon->increment('used_count');
        }
    }

    public function release(Order $order): void
    {
        $order->orderCoupons()->where('status', 'reserved')->update([
            'status' => 'released', 'released_at' => now(),
        ]);
        CouponUserUsage::where('order_id', $order->id)->where('status', 'reserved')->delete();
    }
}
