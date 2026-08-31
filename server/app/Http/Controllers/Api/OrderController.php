<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OrderSuccessMail;
use App\Models\Address;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Services\CheckoutPricingService;
use App\Services\OrderService;
use App\Services\VoucherReservationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly CheckoutPricingService $pricing,
        private readonly VoucherReservationService $vouchers,
    ) {}

    private function relations(): array
    {
        return [
            'items.productVariant.product.images', 'coupon', 'address',
            'orderCoupons.coupon', 'vnpayPaymentAttempts',
        ];
    }

    public function index(Request $request)
    {
        return response()->json([
            'status' => true,
            'orders' => Order::with($this->relations())
                ->where('user_id', $request->user()->id)->latest()->get(),
        ]);
    }

    public function show(Request $request, int $id)
    {
        $order = Order::with($this->relations())
            ->where('user_id', $request->user()->id)->find($id);
        if (!$order) return response()->json(['status' => false, 'message' => 'Không tìm thấy đơn hàng!'], 404);
        return response()->json(['status' => true, 'order' => $order]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'address_id' => ['required', 'integer'],
            'shipping_method' => ['required', Rule::in(['economy', 'standard', 'express'])],
            'product_coupon_id' => ['nullable', 'integer'],
            'shipping_coupon_id' => ['nullable', 'integer', 'different:product_coupon_id'],
            'payment_method' => ['required', Rule::in(['cod', 'vnpay'])],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $order = DB::transaction(function () use ($user, $data) {
                $address = Address::where('user_id', $user->id)
                    ->whereKey($data['address_id'])->lockForUpdate()->first();
                if (!$address) throw new \RuntimeException('Địa chỉ giao hàng không hợp lệ!');

                $quote = $this->pricing->quote(
                    $user, $data['shipping_method'],
                    $data['product_coupon_id'] ?? null,
                    $data['shipping_coupon_id'] ?? null,
                    $address->province, true
                );

                $paymentMethod = $data['payment_method'];
                $order = Order::create([
                    'user_id' => $user->id,
                    'coupon_id' => null,
                    'address_id' => $address->id,
                    'note' => $data['note'] ?? null,
                    'subtotal' => $quote['subtotal'],
                    'shipping_method' => $quote['shipping_method'],
                    'shipping_fee' => $quote['shipping_fee'],
                    'discount_amount' => $quote['discount_amount'],
                    'shipping_discount' => $quote['shipping_discount'],
                    'total_amount' => $quote['total'],
                    'status' => 'pending',
                    'payment_method' => $paymentMethod,
                    'payment_status' => $paymentMethod === 'vnpay' ? 'pending' : 'unpaid',
                    'payment_expires_at' => $paymentMethod === 'vnpay'
                        ? now()->addMinutes(max(5, (int) config('vnpay.expire_minutes', 15))) : null,
                    'shipping_receiver_name' => $address->receiver_name,
                    'shipping_phone' => $address->phone,
                    'shipping_address_type' => $address->type,
                    'shipping_province_code' => $address->province_code,
                    'shipping_province' => $address->province,
                    'shipping_district' => $address->district,
                    'shipping_ward_code' => $address->ward_code,
                    'shipping_ward' => $address->ward,
                    'shipping_street' => $address->street,
                ]);

                foreach ($quote['items'] as $item) {
                    $variant = ProductVariant::with('product')
                        ->whereKey($item->product_variant_id)
                        ->lockForUpdate()
                        ->first();

                    if (!$variant || !$variant->product || $variant->stock < $item->quantity) {
                        throw new \RuntimeException('Một sản phẩm không còn đủ tồn kho!');
                    }

                    $product = $variant->product;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_variant_id' => $variant->id,
                        'quantity' => $item->quantity,
                        'price' => (float) $product->current_price,
                        'product_name_snapshot' => $product->name,
                        'product_sku_snapshot' => $product->sku,
                        'variant_color_snapshot' => $variant->color,
                        'variant_size_snapshot' => $variant->size,
                        'variant_image_snapshot' =>
                            $variant->image_url
                            ?: $variant->image
                            ?: $product->thumbnail,
                    ]);
                    $variant->decrement('stock', (int) $item->quantity);
                }

                $this->vouchers->reserve(
                    $order, $quote['product_coupon'], $quote['shipping_coupon'], $quote
                );
                CartItem::where('user_id', $user->id)->delete();
                return $order;
            }, 3);

            $order->load($this->relations());
            if ($order->payment_method === 'cod') {
                try { Mail::to($user->email)->send(new OrderSuccessMail($order)); }
                catch (\Throwable $e) { Log::warning('Không gửi được email COD', ['message' => $e->getMessage()]); }
            }

            return response()->json([
                'status' => true, 'message' => 'Tạo đơn hàng thành công!',
                'order_id' => $order->id, 'order' => $order,
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            Log::error('Lỗi tạo đơn hàng', ['user_id' => $user->id, 'message' => $e->getMessage()]);
            return response()->json(['status' => false, 'message' => 'Có lỗi xảy ra khi tạo đơn hàng!'], 500);
        }
    }

    public function updatePaymentMethod(Request $request, int $id)
    {
        $data = $request->validate(['payment_method' => ['required', Rule::in(['cod', 'vnpay'])]]);
        try {
            $order = DB::transaction(function () use ($request, $id, $data) {
                $order = Order::where('user_id', $request->user()->id)->whereKey($id)->lockForUpdate()->first();
                if (!$order || $order->status !== 'pending' || $order->payment_status === 'paid') {
                    throw new \RuntimeException('Đơn hàng không còn ở trạng thái chờ thanh toán!');
                }
                $method = $data['payment_method'];
                $order->update([
                    'payment_method' => $method,
                    'payment_status' => $method === 'vnpay' ? 'pending' : 'unpaid',
                    'payment_expires_at' => $method === 'vnpay'
                        ? now()->addMinutes(max(5, (int) config('vnpay.expire_minutes', 15))) : null,
                ]);
                if ($method === 'cod') {
                    $order->vnpayPaymentAttempts()
                        ->where('status', 'pending')->update(['status' => 'expired']);
                    $order->update(['vnpay_txn_ref' => null]);
                }
                return $order->fresh();
            });
            return response()->json(['status' => true, 'order' => $order]);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function cancel(Request $request, int $id)
    {
        try {
            $this->orders->cancelPendingOrder($id, (int) $request->user()->id, 'failed');
            return response()->json(['status' => true, 'message' => 'Đã hủy đơn, hoàn kho và trả voucher!']);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 422);
        }
    }
}
