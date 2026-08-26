<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OrderSuccessMail;
use App\Services\OrderService;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {
    }
    /**
     * Lấy danh sách đơn hàng của người dùng đang đăng nhập.
     */
    public function index(Request $request)
    {
        $orders = Order::with([
            'items.productVariant.product.images',
            'coupon',
            'address',
        ])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status' => true,
            'orders' => $orders,
        ]);
    }

    /**
     * Xem chi tiết một đơn hàng của người dùng.
     */
    public function show(Request $request, int $id)
    {
        $order = Order::with([
            'items.productVariant.product.images',
            'coupon',
            'address',
        ])
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->first();

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng!',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'order' => $order,
        ]);
    }

    /**
     * Tạo đơn hàng từ giỏ hàng.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'address_id' => [
                'required',
                'integer',
                Rule::exists('addresses', 'id')->where(
                    fn ($query) => $query
                        ->where('user_id', $user->id)
                        ->whereNull('deleted_at')
                ),
            ],
            'coupon_id' => [
                'nullable',
                'integer',
                'exists:coupons,id',
            ],
            'payment_method' => [
                'required',
                Rule::in(['cod', 'vnpay']),
            ],
            'note' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        try {
            $order = DB::transaction(function () use ($user, $validated) {
                // Khóa giỏ hàng để hai request đồng thời không tạo hai đơn.
                $cartItems = CartItem::query()
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->get();

                $cartItems->load('productVariant.product');

                if ($cartItems->isEmpty()) {
                    throw new \RuntimeException(
                        'Giỏ hàng của bạn đang trống!'
                    );
                }

                $subtotal = 0;
                $totalQuantity = 0;

                foreach ($cartItems as $item) {
                    if (
                        !$item->productVariant ||
                        !$item->productVariant->product
                    ) {
                        throw new \RuntimeException(
                            'Có sản phẩm trong giỏ hàng không còn tồn tại!'
                        );
                    }

                    $price = (float) $item->productVariant->product->current_price;
                    $quantity = (int) $item->quantity;

                    $subtotal += $price * $quantity;
                    $totalQuantity += $quantity;
                }

                // Mua từ 3 sản phẩm thì miễn phí vận chuyển.
                $shippingFee = $totalQuantity >= 3 ? 0 : 30000;

                $couponId = $validated['coupon_id'] ?? null;
                $coupon = null;
                $discountAmount = 0;

                if ($couponId !== null) {
                    $coupon = Coupon::query()
                        ->withTrashed()
                        ->where('id', $couponId)
                        ->lockForUpdate()
                        ->first();

                    if (!$coupon || $coupon->trashed()) {
                        throw new \RuntimeException(
                            'Mã giảm giá không tồn tại!'
                        );
                    }

                    if (!$coupon->status) {
                        throw new \RuntimeException(
                            'Mã giảm giá này đã bị tạm ngưng!'
                        );
                    }

                    if (
                        $coupon->usage_limit !== null &&
                        $coupon->used_count >= $coupon->usage_limit
                    ) {
                        throw new \RuntimeException(
                            'Mã giảm giá này đã hết lượt sử dụng!'
                        );
                    }

                    $now = Carbon::now();

                    if (
                        ($coupon->expires_at &&
                            $now->greaterThan($coupon->expires_at)) ||
                        ($coupon->end_date &&
                            $now->greaterThan($coupon->end_date))
                    ) {
                        throw new \RuntimeException(
                            'Mã giảm giá này đã hết hạn!'
                        );
                    }

                    if (
                        $coupon->min_order_value !== null &&
                        $subtotal < (float) $coupon->min_order_value
                    ) {
                        throw new \RuntimeException(
                            'Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này!'
                        );
                    }

                    $hasUsed = Order::where('user_id', $user->id)
                        ->where('coupon_id', $coupon->id)
                        ->where('status', '!=', 'cancelled')
                        ->exists();

                    if ($hasUsed) {
                        throw new \RuntimeException(
                            'Bạn đã sử dụng mã giảm giá này rồi!'
                        );
                    }

                    $discountValue = (float) $coupon->discount_value;

                    if ($coupon->discount_type === 'percent') {
                        $discountAmount = min(
                            $subtotal * ($discountValue / 100),
                            $subtotal
                        );
                    } elseif ($coupon->discount_type === 'shipping') {
                        $discountAmount = min(
                            $discountValue,
                            $shippingFee
                        );
                    } elseif ($coupon->discount_type === 'fixed') {
                        $discountAmount = min(
                            $discountValue,
                            $subtotal
                        );
                    } else {
                        throw new \RuntimeException(
                            'Loại mã giảm giá không hợp lệ!'
                        );
                    }
                }

                $finalTotal = max(
                    0,
                    $subtotal + $shippingFee - $discountAmount
                );

                $paymentMethod = $validated['payment_method'];

                $newOrder = Order::create([
                    'user_id' => $user->id,
                    'coupon_id' => $couponId,
                    'address_id' => $validated['address_id'],
                    'note' => $validated['note'] ?? null,
                    'total_amount' => $finalTotal,
                    'status' => 'pending',
                    'payment_method' => $paymentMethod,
                    'payment_status' => $paymentMethod === 'vnpay'
                        ? 'pending'
                        : 'unpaid',
                    'payment_expires_at' => $paymentMethod === 'vnpay'
                        ? now()->addMinutes(max(
                            5,
                            (int) config('vnpay.order_expire_minutes', 30)
                        ))
                        : null,
                ]);

                // Khóa từng biến thể trước khi kiểm tra và trừ tồn kho.
                foreach ($cartItems as $item) {
                    $variant = ProductVariant::query()
                        ->where('id', $item->product_variant_id)
                        ->lockForUpdate()
                        ->first();

                    if (!$variant) {
                        throw new \RuntimeException(
                            'Một biến thể sản phẩm không còn tồn tại!'
                        );
                    }

                    if ($variant->stock < $item->quantity) {
                        $productName =
                            $item->productVariant->product->name ??
                            'Sản phẩm';

                        throw new \RuntimeException(
                            "Sản phẩm {$productName} không đủ số lượng trong kho."
                        );
                    }

                    $price = (float) $item->productVariant->product->current_price;

                    OrderItem::create([
                        'order_id' => $newOrder->id,
                        'product_variant_id' => $item->product_variant_id,
                        'quantity' => $item->quantity,
                        'price' => $price,
                    ]);

                    $variant->decrement(
                        'stock',
                        (int) $item->quantity
                    );
                }

                if ($coupon) {
                    $coupon->increment('used_count');
                }

                CartItem::where('user_id', $user->id)->delete();

                return $newOrder;
            }, 3);

            $order->load([
                'user',
                'items.productVariant.product',
                'coupon',
                'address',
            ]);

            // Với VNPay, email xác nhận sẽ được gửi sau khi thanh toán thành công.
            if ($order->payment_method === 'cod') {
                try {
                    Mail::to($user->email)->send(
                        new OrderSuccessMail($order)
                    );
                } catch (\Throwable $mailException) {
                    Log::error(
                        'Gửi email xác nhận đơn hàng thất bại: ' .
                        $mailException->getMessage()
                    );
                }
            }

            return response()->json([
                'status' => true,
                'message' => 'Tạo đơn hàng thành công!',
                'order_id' => $order->id,
                'order' => $order,
            ], 201);
        } catch (\RuntimeException $exception) {
            Log::warning('Không thể tạo đơn hàng', [
                'user_id' => $user->id,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => $exception->getMessage(),
            ], 422);
        } catch (\Throwable $exception) {
            Log::error('Lỗi tạo đơn hàng', [
                'user_id' => $user->id,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi tạo đơn hàng!',
            ], 500);
        }
    }

    /**
     * Hủy đơn hàng đang chờ xử lý.
     */
    public function cancel(Request $request, int $id)
    {
        $user = $request->user();

        try {
            $this->orderService->cancelPendingOrder(
                $id,
                (int) $user->id,
                'failed'
            );

            return response()->json([
                'status' => true,
                'message' => 'Đã hủy đơn hàng và hoàn lại tồn kho!',
            ]);
        } catch (\RuntimeException $exception) {
            return response()->json([
                'status' => false,
                'message' => $exception->getMessage(),
            ], 422);
        } catch (\Throwable $exception) {
            Log::error('Lỗi hủy đơn hàng', [
                'user_id' => $user->id,
                'order_id' => $id,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi hủy đơn hàng!',
            ], 500);
        }
    }
}
