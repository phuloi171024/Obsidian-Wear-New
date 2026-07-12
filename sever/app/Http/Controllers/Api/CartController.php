<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CartItem;

class CartController extends Controller
{
    // 1. API Lấy danh sách giỏ hàng của user đang đăng nhập
    public function index(Request $request)
    {
        // Lấy ID của khách hàng từ Token đăng nhập
        $userId = $request->user()->id;

        // Lấy các sản phẩm trong giỏ, dùng 'with' để kéo theo thông tin Size/Màu và Tên sản phẩm gốc
        $cartItems = CartItem::with(['productVariant.product'])
                             ->where('user_id', $userId)
                             ->get();

        return response()->json([
            'success' => true,
            'data' => $cartItems
        ], 200);
    }

    // 2. API Thêm sản phẩm vào giỏ
    public function add(Request $request)
    {
        // Bắt buộc client (React) phải gửi mã biến thể và số lượng
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $userId = $request->user()->id;
        $variantId = $request->product_variant_id;
        $quantity = $request->quantity;

        // Kiểm tra xem khách đã thêm đôi giày/cái áo màu này, size này vào giỏ chưa
        $cartItem = CartItem::where('user_id', $userId)
                            ->where('product_variant_id', $variantId)
                            ->first();

        if ($cartItem) {
            // Đã có rồi -> Cộng dồn số lượng
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            // Chưa có -> Tạo dòng mới trong database
            $cartItem = CartItem::create([
                'user_id' => $userId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm sản phẩm vào giỏ hàng',
            'data' => $cartItem
        ], 200);
    }

    // 3. API Cập nhật số lượng (Khi khách bấm nút + hoặc - trên giao diện)
    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        // Tìm đúng sản phẩm trong giỏ của ĐÚNG user này (bảo mật: không cho user khác sửa bậy)
        $cartItem = CartItem::where('id', $id)
                            ->where('user_id', $request->user()->id)
                            ->first();

        if (!$cartItem) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $cartItem->quantity = $request->quantity;
        $cartItem->save();

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật số lượng'
        ], 200);
    }

    // 4. API Xóa một món khỏi giỏ hàng
    public function remove(Request $request, $id)
    {
        $cartItem = CartItem::where('id', $id)
                            ->where('user_id', $request->user()->id)
                            ->first();

        if (!$cartItem) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa sản phẩm khỏi giỏ hàng'
        ], 200);
    }
}