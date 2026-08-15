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
use App\Models\Coupon;
use Carbon\Carbon;

class OrderController extends Controller
{
    // 1. Lấy danh sách đơn hàng của user đang đăng nhập
    public function index(Request $request)
    {
        // Phải dùng with() để gọi kèm chi tiết sản phẩm và biến thể
        $orders = Order::with(['items.productVariant.product'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'orders' => $orders
        ], 200);
    }

    // 2. Tạo đơn hàng mới từ giỏ hàng
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
                    $price = $item->productVariant->product->price;
                    $totalAmount += $price * $item->quantity;
                }

                $finalTotal = $request->input('total_price', $totalAmount);

                // 3. Tạo Đơn hàng lưu vào bảng `orders` (Đã gộp thành 1 lần duy nhất)
                $order = Order::create([
                    'user_id'      => $user->id,
                    'total_amount' => $finalTotal,
                    'status'       => 'pending', 
                    'coupon_id'    => $request->input('coupon_id'), // Hứng ID mã giảm giá
                    'address_id'   => $request->input('address_id'), // Hứng địa chỉ
                    'note'         => $request->input('note'),       // Hứng ghi chú
                ]);

                // 👇 ĐOẠN QUAN TRỌNG: TĂNG LƯỢT DÙNG MÃ GIẢM GIÁ (used_count)
                if ($request->filled('coupon_id')) {
                    $coupon = Coupon::find($request->input('coupon_id'));
                    if ($coupon) {
                        $coupon->increment('used_count'); // Cộng thêm 1 lượt dùng
                    }
                }

                // 4. Lưu từng món hàng vào bảng `order_items` và Trừ tồn kho
                foreach ($cartItems as $item) {
                    $price = $item->productVariant->product->price;

                    OrderItem::create([
                        'order_id'           => $order->id,
                        'product_variant_id' => $item->product_variant_id,
                        'quantity'           => $item->quantity,
                        'price'              => $price,
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
                    'status'   => true,
                    'message'  => 'Tạo đơn hàng thành công!',
                    'order_id' => $order->id, // ID thật để frontend chuyển cho VNPay
                    'order'    => $order
                ], 201);
            });

        } catch (\Exception $e) {
            Log::error("Lỗi tạo đơn hàng: " . $e->getMessage());
            return response()->json([
                'status'  => false, 
                'message' => $e->getMessage()
            ], 500);
        }
    }


    // 3. Hủy đơn hàng
    public function cancel(Request $request, int $id)
    {
        $user = $request->user();
        
        $order = Order::with('items.productVariant')->where('id', $id)->where('user_id', $user->id)->first();

        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy đơn hàng!'], 404);
        }

        // Theo Usecase: Chỉ được hủy khi đơn hàng đang ở trạng thái 'pending'
        if ($order->status !== 'pending') {
            return response()->json(['status' => false, 'message' => 'Đơn hàng này không thể hủy vì đã được xử lý!'], 400);
        }

        try {
            DB::beginTransaction();

            // Đổi trạng thái sang hủy
            $order->status = 'cancelled';
            $order->save();

            // Hoàn lại số lượng tồn kho (stock) cho các biến thể sản phẩm
            foreach ($order->items as $item) {
                $variant = $item->productVariant;
                if ($variant) {
                    $variant->stock += $item->quantity;
                    $variant->save();
                }
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Đã hủy đơn hàng thành công và hoàn lại tồn kho!'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => false, 'message' => 'Có lỗi xảy ra khi hủy đơn hàng!'], 500);
        }
    }
    
    // 4. Áp dụng mã giảm giá ở giỏ hàng (Check điều kiện)
    public function apply(Request $request)
    {
        // 1. Validate dữ liệu frontend gửi lên
        $validated = $request->validate([
            'code'        => 'required|string|max:255',
            'order_value' => 'required|numeric|min:0',
        ]);

        $code = strtoupper(trim($validated['code']));
        $orderValue = (float) $validated['order_value'];
        $user = $request->user(); // Lấy user hiện tại

        // 2. Tìm coupon
        $coupon = Coupon::whereRaw('UPPER(code) = ?', [$code])->first();

        if (!$coupon) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá không tồn tại!'], 404);
        }

        // 3. Kiểm tra trạng thái và Soft Delete
        if (!$coupon->status || $coupon->trashed()) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá này đã bị khóa hoặc không khả dụng!'], 400);
        }

        // 4. Kiểm tra hạn expires_at & end_date
        $now = Carbon::now();
        if (($coupon->expires_at && $now->greaterThan($coupon->expires_at)) || 
            ($coupon->end_date && $now->greaterThan($coupon->end_date))) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá đã hết hạn sử dụng!'], 400);
        }

        // 5. Kiểm tra tổng lượt dùng của cả hệ thống
        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá đã hết lượt sử dụng!'], 400);
        }

        // 6. KIỂM TRA MỖI USER CHỈ ĐƯỢC DÙNG 1 LẦN
        if ($user) {
            $hasUsed = Order::where('user_id', $user->id)
                ->where('coupon_id', $coupon->id)
                ->where('status', '!=', 'cancelled') // Trừ các đơn đã hủy ra
                ->exists();

            if ($hasUsed) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Bạn đã sử dụng mã giảm giá này rồi! Mỗi người chỉ được dùng 1 lần.'
                ], 400);
            }
        }

        // 7. Kiểm tra giá trị đơn hàng tối thiểu
        if ($coupon->min_order_value !== null && $orderValue < (float) $coupon->min_order_value) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng chưa đạt giá trị tối thiểu ' . number_format((float) $coupon->min_order_value, 0, ',', '.') . 'đ để áp dụng mã này.',
            ], 400);
        }

        // 8. Kiểm tra loại coupon
        if (!in_array($coupon->discount_type, ['fixed', 'percent', 'shipping'], true)) {
            return response()->json(['success' => false, 'message' => 'Loại mã giảm giá không hợp lệ!'], 422);
        }

        // 9. Tính thử giá trị giảm để Frontend hiển thị
        $discountValue = (float) $coupon->discount_value;
        if ($coupon->discount_type === 'percent') {
            $discountAmount = min($orderValue * ($discountValue / 100), $orderValue);
        } elseif ($coupon->discount_type === 'fixed') {
            $discountAmount = min($discountValue, $orderValue);
        } else {
            $discountAmount = $discountValue; // shipping
        }

        // 10. Trả dữ liệu cho frontend
        return response()->json([
            'success' => true,
            'message' => 'Áp dụng mã giảm giá thành công!',
            'data' => [
                'id'              => $coupon->id,
                'code'            => $coupon->code,
                'discount_type'   => $coupon->discount_type,
                'discount_value'  => (float) $coupon->discount_value,
                'discount_amount' => $discountAmount,
                'min_order_value' => (float) $coupon->min_order_value,
                'type'            => $coupon->discount_type === 'shipping' ? 'shipping' : 'product',
            ],
        ], 200);
    }
}