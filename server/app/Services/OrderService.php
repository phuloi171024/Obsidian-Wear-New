<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OrderService
{
    public function __construct(
        private readonly VoucherReservationService $vouchers
    ) {}

    private const STATUS_FLOW = [
        'pending' => ['shipped', 'cancelled'],
        'shipped' => ['completed'],
        'completed' => [],
        'cancelled' => [],
    ];

    public function updateStatus(int $orderId, string $newStatus): Order
    {
        return DB::transaction(function () use ($orderId, $newStatus) {
            $order = Order::query()
                ->whereKey($orderId)
                ->lockForUpdate()
                ->firstOrFail();

            $allowed = self::STATUS_FLOW[$order->status] ?? [];

            if (!in_array($newStatus, $allowed, true)) {
                throw new RuntimeException(
                    "Không thể chuyển đơn từ '{$order->status}' sang '{$newStatus}'."
                );
            }

            if ($newStatus === 'cancelled') {
                return $this->cancelLockedOrder($order, 'failed');
            }

            if (
                in_array($newStatus, ['shipped', 'completed'], true) &&
                $order->payment_method === 'vnpay' &&
                $order->payment_status !== 'paid'
            ) {
                throw new RuntimeException(
                    'Đơn VNPay chưa được xác nhận thanh toán!'
                );
            }

            $updates = ['status' => $newStatus];

            if (
                $newStatus === 'completed' &&
                $order->payment_method === 'cod'
            ) {
                $updates['payment_status'] = 'paid';
                $updates['paid_at'] = now();
            }

            $order->update($updates);

            if ($newStatus === 'completed' && $order->payment_method === 'cod') {
                $this->vouchers->consume($order);
            }

            return $order->fresh();
        }, 3);
    }

    public function cancelPendingOrder(
        int $orderId,
        ?int $ownerId = null,
        string $paymentStatus = 'failed'
    ): Order {
        return DB::transaction(function () use (
            $orderId,
            $ownerId,
            $paymentStatus
        ) {
            $query = Order::query()
                ->whereKey($orderId)
                ->lockForUpdate();

            if ($ownerId !== null) {
                $query->where('user_id', $ownerId);
            }

            $order = $query->first();

            if (!$order) {
                throw new RuntimeException('Không tìm thấy đơn hàng!');
            }

            if ($order->status !== 'pending') {
                throw new RuntimeException(
                    'Đơn hàng này không thể hủy vì đã được xử lý!'
                );
            }

            return $this->cancelLockedOrder($order, $paymentStatus);
        }, 3);
    }

    public function expirePendingOrders(int $limit = 100): int
    {
        $expiredIds = Order::query()
            ->where('status', 'pending')
            ->where('payment_status', '!=', 'paid')
            ->where(function ($query) {
                $query
                    ->where('payment_expires_at', '<=', now())
                    ->orWhere(function ($legacyQuery) {
                        $legacyQuery
                            ->whereNull('payment_expires_at')
                            ->where(function ($methodQuery) {
                                $methodQuery
                                    ->where(function ($vnpayQuery) {
                                        $vnpayQuery->where('payment_method', 'vnpay')
                                            ->where('created_at', '<=', now()->subMinutes(
                                                max(5, (int) config('vnpay.order_expire_minutes', 30))
                                            ));
                                    })
                                    ->orWhere(function ($codQuery) {
                                        $codQuery->where('payment_method', 'cod')
                                            ->where('created_at', '<=', now()->subMinutes(
                                                max(5, (int) config('checkout.cod_reservation_minutes', 1440))
                                            ));
                                    });
                            });
                    });
            })
            ->orderBy('id')
            ->limit(max(1, min($limit, 1000)))
            ->pluck('id');

        $expiredCount = 0;

        foreach ($expiredIds as $orderId) {
            try {
                $this->cancelPendingOrder(
                    (int) $orderId,
                    null,
                    'expired'
                );
                $expiredCount++;
            } catch (RuntimeException) {
                // Đơn có thể vừa được IPN hoặc admin xử lý trước khi tới lượt.
            }
        }

        return $expiredCount;
    }

    /** Giữ tương thích nếu máy chủ cũ vẫn đang gọi tên command/service này. */
    public function expirePendingVnpayOrders(int $limit = 100): int
    {
        return $this->expirePendingOrders($limit);
    }

    private function cancelLockedOrder(
        Order $order,
        string $paymentStatus
    ): Order {
        if ($order->payment_status === 'paid') {
            throw new RuntimeException(
                'Đơn đã thanh toán. Cần hoàn tiền trước khi hủy!'
            );
        }

        $order->loadMissing('items');

        foreach ($order->items as $item) {
            $variant = ProductVariant::withTrashed()
                ->whereKey($item->product_variant_id)
                ->lockForUpdate()
                ->first();

            if ($variant) {
                $variant->increment('stock', (int) $item->quantity);
            }
        }

        $this->vouchers->release($order);

        // Tương thích đơn cũ dùng orders.coupon_id.
        if ($order->coupon_id !== null && !$order->orderCoupons()->exists()) {
            $coupon = Coupon::withTrashed()
                ->whereKey($order->coupon_id)
                ->lockForUpdate()
                ->first();

            if ($coupon && $coupon->used_count > 0) {
                $coupon->decrement('used_count');
            }
        }

        if ($order->payment_method === 'vnpay') {
            $order->vnpayPaymentAttempts()
                ->where('status', 'pending')
                ->update(['status' => $paymentStatus]);
        }

        $updates = [
            'status' => 'cancelled',
            'payment_expires_at' => null,
        ];

        if (
            $order->payment_method === 'vnpay' &&
            $order->payment_status !== 'paid'
        ) {
            $updates['payment_status'] = $paymentStatus;
        }

        $order->update($updates);

        return $order->fresh();
    }
}
