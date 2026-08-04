<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\CartItem;
use App\Http\Controllers\Controller;

class CartController extends Controller
{
    // 1. API Lấy danh sách giỏ hàng của user đang đăng nhập[cite: 35]
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $cartItems = CartItem::with(['productVariant.product'])
                             ->where('user_id', $userId)
                             ->get();

        return response()->json([
            'success' => true,
            'data' => $cartItems
        ], 200);
    }

    // 2. API Thêm sản phẩm vào giỏ[cite: 35]
    public function add(Request $request)
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $userId = $request->user()->id;
        $variantId = $request->product_variant_id;
        $quantity = $request->quantity;

        $cartItem = CartItem::where('user_id', $userId)
                            ->where('product_variant_id', $variantId)
                            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
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

    // 3. API Cập nhật số lượng[cite: 35]
    public function update(Request $request, int $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

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

    // 4. API Xóa một món khỏi giỏ hàng[cite: 35]
    public function remove(Request $request, int $id)
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