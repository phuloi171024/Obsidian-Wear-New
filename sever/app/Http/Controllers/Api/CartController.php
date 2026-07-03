<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Lấy giỏ hàng của user (tạo mới nếu chưa có)
     * GET /cart
     */
    public function index(Request $request)
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cart->load([
            'items.variant.product.images',
            'items.variant.product.brand',
        ]);

        // Tính tổng tiền
        $total = $cart->items->sum(function ($item) {
            return $item->quantity * $item->variant->product->price;
        });

        return response()->json([
            'cart'  => $cart,
            'total' => $total,
        ]);
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     * POST /cart
     * Body: { product_variant_id, quantity }
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity'           => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $variant = ProductVariant::findOrFail($request->product_variant_id);

        if ($variant->stock < $request->quantity) {
            return response()->json([
                'message' => 'Sản phẩm không đủ số lượng trong kho!',
                'stock'   => $variant->stock,
            ], 400);
        }

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        // Nếu item đã có trong giỏ thì cộng thêm số lượng
        $cartItem = $cart->items()->where('product_variant_id', $request->product_variant_id)->first();

        if ($cartItem) {
            $newQty = $cartItem->quantity + $request->quantity;

            if ($variant->stock < $newQty) {
                return response()->json([
                    'message' => 'Số lượng vượt quá tồn kho!',
                    'stock'   => $variant->stock,
                ], 400);
            }

            $cartItem->update(['quantity' => $newQty]);
        } else {
            $cartItem = $cart->items()->create([
                'product_variant_id' => $request->product_variant_id,
                'quantity'           => $request->quantity,
            ]);
        }

        return response()->json([
            'message'   => 'Đã thêm sản phẩm vào giỏ hàng!',
            'cart_item' => $cartItem->load('variant.product.images'),
        ], 201);
    }

    /**
     * Cập nhật số lượng item trong giỏ
     * PUT /cart/{cartItemId}
     * Body: { quantity }
     */
    public function update(Request $request, $cartItemId)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cart = Cart::where('user_id', $request->user()->id)->firstOrFail();
        $cartItem = $cart->items()->findOrFail($cartItemId);

        // Kiểm tra tồn kho
        $variant = $cartItem->variant;
        if ($variant->stock < $request->quantity) {
            return response()->json([
                'message' => 'Số lượng vượt quá tồn kho!',
                'stock'   => $variant->stock,
            ], 400);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json([
            'message'   => 'Đã cập nhật số lượng!',
            'cart_item' => $cartItem,
        ]);
    }

    /**
     * Xóa 1 item khỏi giỏ hàng
     * DELETE /cart/{cartItemId}
     */
    public function destroy(Request $request, $cartItemId)
    {
        $cart = Cart::where('user_id', $request->user()->id)->firstOrFail();
        $cartItem = $cart->items()->findOrFail($cartItemId);
        $cartItem->delete();

        return response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng!']);
    }

    /**
     * Xóa toàn bộ giỏ hàng
     * DELETE /cart
     */
    public function clear(Request $request)
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();

        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json(['message' => 'Đã xóa toàn bộ giỏ hàng!']);
    }
}
