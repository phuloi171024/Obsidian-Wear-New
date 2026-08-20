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

    // 2. Tạo đơn hàng mới từ giỏ hàng (ĐÃ FIX AC58 - TỰ TÍNH TIỀN)
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

                // 2. TÍNH TIỀN TỪ DATABASE (Bảo mật: Không nhận total_price từ Frontend)
                $subtotal = 0;
                $totalQuantity = 0;
                
                foreach ($cartItems as $item) {
                    // Lấy giá thực tế từ Database
                    $price = $item->productVariant->product->price;
                    $subtotal += $price * $item->quantity;
                    $totalQuantity += $item->quantity;
                }

                // Phí vận chuyển: Đồng bộ logic >= 3 cái freeship, ngược lại 30k
                $shippingFee = ($totalQuantity >= 3) ? 0 : 30000;

                // ==============================================================
                // XỬ LÝ MÃ GIẢM GIÁ - BƯỚC CHỐT CHẶN THANH TOÁN CUỐI CÙNG
                // ==============================================================
                $discountAmount = 0;
                $couponId = $request->input('coupon_id'); 

                if (!empty($couponId)) {
                    $coupon = Coupon::find($couponId);

                    // 1. Kiểm tra tồn tại
                    if (!$coupon || $coupon->trashed()) {
                        return response()->json(['status' => false, 'message' => 'Mã giảm giá không tồn tại!'], 404);
                    }
                    // 2. Kiểm tra trạng thái khóa
                    if (!$coupon->status) {
                        return response()->json(['status' => false, 'message' => 'Mã giảm giá này đã bị tạm ngưng!'], 400);
                    }
                    // 3. Kiểm tra số lượt sử dụng
                    if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
                        return response()->json(['status' => false, 'message' => 'Mã giảm giá này đã hết lượt sử dụng!'], 400);
                    }
                    // 4. Kiểm tra ngày hết hạn
                    $now = Carbon::now();
                    if (($coupon->expires_at && $now->greaterThan($coupon->expires_at)) || ($coupon->end_date && $now->greaterThan($coupon->end_date))) {
                        return response()->json(['status' => false, 'message' => 'Mã giảm giá này đã hết hạn!'], 400);
                    }
                    // 5. Kiểm tra giá trị đơn hàng tối thiểu
                    if ($coupon->min_order_value !== null && $subtotal < $coupon->min_order_value) {
                        return response()->json(['status' => false, 'message' => 'Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này!'], 400);
                    }

                    // ==========================================
                    // THÊM CHỐT CHẶN: MỖI USER CHỈ ĐƯỢC DÙNG 1 LẦN 
                    // ==========================================
                    $hasUsed = Order::where('user_id', $user->id)
                                    ->where('coupon_id', $coupon->id)
                                    ->where('status', '!=', 'cancelled') 
                                    ->exists();

                    if ($hasUsed) {
                        return response()->json(['status' => false, 'message' => 'Bạn đã sử dụng mã giảm giá này cho một đơn hàng trước đó rồi!'], 400);
                    }
                    // ==========================================

                    // Tính số tiền được giảm nếu vượt qua hết chốt chặn
                    if ($coupon->discount_type === 'percent') {
                        $discountAmount = min($subtotal * ($coupon->discount_value / 100), $subtotal);
                    } elseif ($coupon->discount_type === 'shipping') {
                        $discountAmount = min($coupon->discount_value, $shippingFee);
                    } else {
                        // Fixed discount
                        $discountAmount = min($coupon->discount_value, $subtotal);
                    }
                }

                // TỔNG TIỀN CHUẨN XÁC CUỐI CÙNG
                $finalTotal = max(0, $subtotal + $shippingFee - $discountAmount);

                // 3. Tạo Đơn hàng
                $order = Order::create([
                    'user_id'      => $user->id,
                    'total_amount' => $finalTotal, // Dùng tổng tiền Backend tự tính
                    'status'       => 'pending', 
                    'coupon_id'    => empty($couponId) ? null : $couponId, 
                    'address_id'   => $request->input('address_id'),
                    'note'         => $request->input('note'),
                ]);

                // Cộng lượt dùng mã giảm giá
                if (!empty($couponId) && isset($coupon)) {
                    $coupon->used_count = $coupon->used_count + 1;
                    $coupon->save();
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

            // Hoàn lại lượt dùng mã giảm giá
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
    
    // 4. Áp dụng mã giảm giá ở giỏ hàng (Check điều kiện lúc bấm Áp Dụng)
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

        // ==============================================================
        // 5 CHỐT CHẶN BẢO MẬT MÃ GIẢM GIÁ
        // ==============================================================
        
        // 1. Kiểm tra tồn tại
        if (!$coupon || $coupon->trashed()) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá không tồn tại!'], 404);
        }

        // 2. Kiểm tra khóa
        if (!$coupon->status) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá này đã bị tạm ngưng!'], 400);
        }

        // 3. Kiểm tra số lượt sử dụng
        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá này đã hết lượt sử dụng!'], 400);
        }

        // 4. Kiểm tra ngày hết hạn
        $now = Carbon::now();
        if (($coupon->expires_at && $now->greaterThan($coupon->expires_at)) || 
            ($coupon->end_date && $now->greaterThan($coupon->end_date))) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá đã hết hạn sử dụng!'], 400);
        }

        // 5. Kiểm tra giá trị đơn hàng tối thiểu
        if ($coupon->min_order_value !== null && $orderValue < (float) $coupon->min_order_value) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng chưa đạt giá trị tối thiểu ' . number_format((float) $coupon->min_order_value, 0, ',', '.') . 'đ để áp dụng mã này.',
            ], 400);
        }

        // KIỂM TRA MỖI USER CHỈ ĐƯỢC DÙNG 1 LẦN
        if ($user) {
            $hasUsed = Order::where('user_id', $user->id)
                ->where('coupon_id', $coupon->id)
                ->where('status', '!=', 'cancelled') 
                ->exists();

            if ($hasUsed) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Bạn đã sử dụng mã giảm giá này rồi! Mỗi người chỉ được dùng 1 lần.'
                ], 400);
            }
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