<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    // Lấy danh sách đơn hàng của user đang đăng nhập
   public function index(Request $request)
    {
        $user = $request->user();
        
        
        $orders = Order::with(['items.productVariant.product'])
                    ->where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json([
            'status' => true,
            'orders' => $orders
        ], 200);
    }
    // Tạo đơn hàng mới từ giỏ hàng
    public function store(Request $request)
    {
        $user = $request->user();

        try {
            return DB::transaction(function () use ($user, $request) {
                // 1. Lấy tất cả sản phẩm trong giỏ hàng của User
                $cartItems = CartItem::with('productVariant.product')->where('user_id', $user->id)->get();

                if ($cartItems->isEmpty()) {
                    return response()->json(['status' => false, 'message' => 'Giỏ hàng của bạn đang trống!'], 400);
                }

                // 2. Tính tổng tiền bảo mật từ Backend
                $totalAmount = 0;
                foreach ($cartItems as $item) {
                    // Lấy giá từ bảng products thông qua relation
                    $price = $item->productVariant->product->price;
                    $totalAmount += $price * $item->quantity;
                }

                // Ở đây lấy tạm total_price frontend gửi lên để bao gồm cả phí ship (Nếu em đã xử lý coupon bên frontend)
                // Thực tế triển khai sâu hơn em nên check DB Coupon tại đây.
                $finalTotal = $request->input('total_price', $totalAmount);

                // 3. Tạo Đơn hàng lưu vào bảng `orders`
                $order = Order::create([
                    'user_id' => $user->id,
                    'total_amount' => $finalTotal,
                    'status' => 'pending', 
                    'coupon_id' => null, // Gắn ID coupon nếu có
                ]);

                // 4. Lưu từng món hàng vào bảng `order_items` và Trừ tồn kho
                foreach ($cartItems as $item) {
                    $price = $item->productVariant->product->price;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_variant_id' => $item->product_variant_id,
                        'quantity' => $item->quantity,
                        'price' => $price,
                    ]);

                    // Trừ số lượng tồn kho trong bảng product_variants
                    $variant = ProductVariant::find($item->product_variant_id);
                    if ($variant) {
                        if ($variant->stock < $item->quantity) {
                            throw new \Exception("Sản phẩm {$item->productVariant->product->name} không đủ số lượng trong kho.");
                        }
                        $variant->stock -= $item->quantity;
                        $variant->save();
                    }
                }

                // 5. Xóa sạch giỏ hàng của User sau khi đặt hàng thành công
                CartItem::where('user_id', $user->id)->delete();

                return response()->json([
                    'status' => true,
                    'message' => 'Tạo đơn hàng thành công!',
                    'order_id' => $order->id, // ID thật để frontend chuyển cho VNPay
                    'order' => $order
                ], 201);
            });

        } catch (\Exception $e) {
            Log::error("Lỗi tạo đơn hàng: " . $e->getMessage());
            return response()->json([
                'status' => false, 
                'message' => $e->getMessage()
            ], 500);
        }
    }
}