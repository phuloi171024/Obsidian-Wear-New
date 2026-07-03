<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Xem lịch sử đơn hàng của user
     * GET /orders
     */
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.variant.product.images', 'coupon'])
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    /**
     * Xem chi tiết 1 đơn hàng
     * GET /orders/{id}
     */
    public function show(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with(['items.variant.product.images', 'coupon'])
            ->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Tạo đơn hàng từ giỏ hàng
     * POST /orders
     * Body: { coupon_code? }
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'coupon_code' => 'nullable|string|exists:coupons,code',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)
            ->with('items.variant.product')
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng đang trống!'], 400);
        }

        // Tính tổng tiền
        $totalAmount = 0;
        foreach ($cart->items as $item) {
            $totalAmount += $item->quantity * $item->variant->product->price;
        }

        // Xử lý coupon (nếu có)
        $coupon = null;
        $discount = 0;

        if ($request->filled('coupon_code')) {
            $coupon = Coupon::where('code', $request->coupon_code)->first();

            if (!$coupon || !$coupon->isValid()) {
                return response()->json(['message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn!'], 400);
            }

            $discount = $coupon->discount_value;
        }

        $finalAmount = max(0, $totalAmount - $discount);

        // Dùng transaction để đảm bảo toàn vẹn dữ liệu
        $order = DB::transaction(function () use ($user, $cart, $coupon, $finalAmount) {

            // Kiểm tra tồn kho trước khi đặt hàng
            foreach ($cart->items as $item) {
                $variant = ProductVariant::lockForUpdate()->find($item->product_variant_id);
                if ($variant->stock < $item->quantity) {
                    throw new \Exception(
                        "Sản phẩm '{$item->variant->product->name}' không đủ hàng trong kho!"
                    );
                }
            }

            // Tạo đơn hàng
            $order = Order::create([
                'user_id'      => $user->id,
                'coupon_id'    => $coupon?->id,
                'total_amount' => $finalAmount,
                'status'       => 'pending',
            ]);

            // Tạo chi tiết đơn hàng + trừ tồn kho
            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_variant_id' => $item->product_variant_id,
                    'quantity'           => $item->quantity,
                    'price'              => $item->variant->product->price,
                ]);

                // Trừ tồn kho
                ProductVariant::where('id', $item->product_variant_id)
                    ->decrement('stock', $item->quantity);
            }

            // Xóa giỏ hàng sau khi đặt hàng thành công
            $cart->items()->delete();

            return $order;
        });

        return response()->json([
            'message' => 'Đặt hàng thành công!',
            'order'   => $order->load(['items.variant.product.images', 'coupon']),
        ], 201);
    }

    /**
     * Hủy đơn hàng (chỉ khi đang ở trạng thái 'pending')
     * PUT /orders/{id}/cancel
     */
    public function cancel(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Chỉ có thể hủy đơn hàng đang chờ xử lý!',
            ], 400);
        }

        DB::transaction(function () use ($order) {
            // Hoàn lại tồn kho
            foreach ($order->items as $item) {
                ProductVariant::where('id', $item->product_variant_id)
                    ->increment('stock', $item->quantity);
            }

            $order->update(['status' => 'cancelled']);
        });

        return response()->json([
            'message' => 'Đã hủy đơn hàng thành công!',
            'order'   => $order,
        ]);
    }
}
