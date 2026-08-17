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
                // 1. Lấy giỏ hàng
                $cartItems = CartItem::with('productVariant.product')->where('user_id', $user->id)->get();

                if ($cartItems->isEmpty()) {
                    return response()->json(['status' => false, 'message' => 'Giỏ hàng của bạn đang trống!'], 400);
                }

                // 2. Tính tiền
                $totalAmount = 0;
                foreach ($cartItems as $item) {
                    $price = $item->productVariant->product->price;
                    $totalAmount += $price * $item->quantity;
                }
                $finalTotal = $request->input('total_price', $totalAmount);
                $couponId = $request->input('coupon_id'); // Lấy mã giảm giá thẳng từ Request

                // 3. Tạo Đơn hàng
                $order = Order::create([
                    'user_id'      => $user->id,
                    'total_amount' => $finalTotal,
                    'status'       => 'pending', 
                    'coupon_id'    => empty($couponId) ? null : $couponId, // Lưu ID mã giảm giá
                    'address_id'   => $request->input('address_id'),
                    'note'         => $request->input('note'),
                ]);

                // 👇 ĐOẠN QUAN TRỌNG NHẤT: CỘNG LƯỢT DÙNG MÃ GIẢM GIÁ
                if (!empty($couponId)) {
                    $coupon = Coupon::find($couponId);
                    if ($coupon) {
                        $coupon->used_count = $coupon->used_count + 1; // Cộng 1 lượt dùng
                        $coupon->save(); // Lưu thẳng vào DB
                    }
                }

                // 4. Lưu items và Trừ tồn kho
                foreach ($cartItems as $item) {
                    $price = $item->productVariant->product->price;

                    OrderItem::create([
                        'order_id'           => $order->id,
                        'product_variant_id' => $item->product_variant_id,
                        'quantity'           => $item->quantity,
                        'price'              => $price,
                    ]);

                    $variant = ProductVariant::find($item->product_variant_id);
                    if ($variant) {
                        if ($variant->stock < $item->quantity) {
                            throw new \Exception("Sản phẩm {$item->productVariant->product->name} không đủ số lượng trong kho.");
                        }
                        $variant->stock -= $item->quantity;
                        $variant->save();
                    }
                }

                // 5. Xóa giỏ hàng
                CartItem::where('user_id', $user->id)->delete();

                return response()->json([
                    'status'   => true,
                    'message'  => 'Tạo đơn hàng thành công!',
                    'order_id' => $order->id,
                    'order'    => $order
                ], 201);
            });

        } catch (\Exception $e) {
            Log::error("Lỗi tạo đơn hàng: " . $e->getMessage());
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
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

        if ($order->status !== 'pending') {
            return response()->json(['status' => false, 'message' => 'Đơn hàng này không thể hủy vì đã được xử lý!'], 400);
        }

        try {
            DB::beginTransaction();

            $order->status = 'cancelled';
            $order->save();

            // Hoàn lại số lượng tồn kho (stock)
            foreach ($order->items as $item) {
                $variant = $item->productVariant;
                if ($variant) {
                    $variant->stock += $item->quantity;
                    $variant->save();
                }
            }

            // 👇 THÊM MỚI: NẾU ĐƠN HÀNG CÓ MÃ GIẢM GIÁ -> TRẢ LẠI 1 LƯỢT DÙNG CHO MÃ ĐÓ
            if ($order->coupon_id != null) {
                $coupon = Coupon::find($order->coupon_id);
                if ($coupon && $coupon->used_count > 0) {
                    $coupon->used_count = $coupon->used_count - 1;
                    $coupon->save();
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
        $validated = $request->validate([
            'code'        => 'required|string|max:255',
            'order_value' => 'required|numeric|min:0',
        ]);

        $code = strtoupper(trim($validated['code']));
        $orderValue = (float) $validated['order_value'];
        $user = $request->user(); 

        $coupon = Coupon::whereRaw('UPPER(code) = ?', [$code])->first();

        if (!$coupon) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá không tồn tại!'], 404);
        }

        if (!$coupon->status || $coupon->trashed()) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá này đã bị khóa hoặc không khả dụng!'], 400);
        }

        $now = Carbon::now();
        if (($coupon->expires_at && $now->greaterThan($coupon->expires_at)) || 
            ($coupon->end_date && $now->greaterThan($coupon->end_date))) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá đã hết hạn sử dụng!'], 400);
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá đã hết lượt sử dụng!'], 400);
        }

        // 6. KIỂM TRA MỖI USER CHỈ ĐƯỢC DÙNG 1 LẦN (SẼ HOẠT ĐỘNG HOÀN HẢO SAU KHI SỬA BƯỚC 1)
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

        if ($coupon->min_order_value !== null && $orderValue < (float) $coupon->min_order_value) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng chưa đạt giá trị tối thiểu ' . number_format((float) $coupon->min_order_value, 0, ',', '.') . 'đ để áp dụng mã này.',
            ], 400);
        }

        if (!in_array($coupon->discount_type, ['fixed', 'percent', 'shipping'], true)) {
            return response()->json(['success' => false, 'message' => 'Loại mã giảm giá không hợp lệ!'], 422);
        }

        $discountValue = (float) $coupon->discount_value;
        if ($coupon->discount_type === 'percent') {
            $discountAmount = min($orderValue * ($discountValue / 100), $orderValue);
        } elseif ($coupon->discount_type === 'fixed') {
            $discountAmount = min($discountValue, $orderValue);
        } else {
            $discountAmount = $discountValue; 
        }

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