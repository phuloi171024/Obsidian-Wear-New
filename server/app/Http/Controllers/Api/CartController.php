<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * 1. Lấy toàn bộ giỏ hàng của user hiện tại
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $cartItems = CartItem::with([
            'productVariant.product'
        ])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy giỏ hàng thành công',
            'data' => $cartItems,
        ], 200);
    }

    /**
     * 2. Thêm sản phẩm vào giỏ
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_variant_id' => [
                'required',
                'integer',
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {

            // Khóa row variant trong transaction để tránh race condition
            $variant = ProductVariant::with('product')
                ->where('id', $request->product_variant_id)
                ->whereNull('deleted_at')
                ->lockForUpdate()
                ->first();

            // Variant không tồn tại hoặc đã bị xóa
            if (!$variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Biến thể sản phẩm không tồn tại hoặc đã bị xóa.',
                ], 404);
            }

            // Sản phẩm cha không tồn tại / đã bị xóa
            if (!$variant->product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm không tồn tại hoặc đã bị xóa.',
                ], 404);
            }

            // Sản phẩm đang bị khóa / ngừng bán
            if (!$variant->product->status) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm hiện đang ngừng bán.',
                ], 422);
            }

            $requestedQuantity = (int) $request->quantity;

            // Hết hàng
            if ($variant->stock <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm đã hết hàng.',
                ], 422);
            }

            // Tìm item hiện có
            $cartItem = CartItem::where('user_id', $user->id)
                ->where('product_variant_id', $variant->id)
                ->lockForUpdate()
                ->first();

            // Nếu đã có trong giỏ thì cộng thêm
            $newQuantity = $cartItem
                ? $cartItem->quantity + $requestedQuantity
                : $requestedQuantity;

            // Không được vượt quá stock
            if ($newQuantity > $variant->stock) {
                return response()->json([
                    'success' => false,
                    'message' => "Chỉ còn {$variant->stock} sản phẩm trong kho.",
                    'available_stock' => $variant->stock,
                    'requested_quantity' => $newQuantity,
                ], 422);
            }

            if ($cartItem) {
                $cartItem->quantity = $newQuantity;
                $cartItem->save();
            } else {
                $cartItem = CartItem::create([
                    'user_id' => $user->id,
                    'product_variant_id' => $variant->id,
                    'quantity' => $requestedQuantity,
                ]);
            }

            // Trả lại dữ liệu đầy đủ cho frontend
            $cartItem->load([
                'productVariant.product'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã thêm sản phẩm vào giỏ hàng.',
                'data' => $cartItem,
            ], 200);
        });
    }

    /**
     * 3. Cập nhật số lượng
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user, $id) {

            // Chỉ được sửa item thuộc user hiện tại
            $cartItem = CartItem::where('id', $id)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy sản phẩm trong giỏ hàng.',
                ], 404);
            }

            // Lấy variant và khóa row stock
            $variant = ProductVariant::with('product')
                ->where('id', $cartItem->product_variant_id)
                ->whereNull('deleted_at')
                ->lockForUpdate()
                ->first();

            if (!$variant || !$variant->product) {
                // Variant đã bị xóa => xóa item khỏi cart
                $cartItem->delete();

                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm không còn tồn tại và đã được xóa khỏi giỏ hàng.',
                ], 404);
            }

            // Sản phẩm bị ngừng bán
            if (!$variant->product->status) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm hiện đang ngừng bán.',
                ], 422);
            }

            if ($variant->stock <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm đã hết hàng.',
                ], 422);
            }

            $newQuantity = (int) $request->quantity;

            // Không vượt stock
            if ($newQuantity > $variant->stock) {
                return response()->json([
                    'success' => false,
                    'message' => "Chỉ còn {$variant->stock} sản phẩm trong kho.",
                    'available_stock' => $variant->stock,
                    'requested_quantity' => $newQuantity,
                ], 422);
            }

            $cartItem->quantity = $newQuantity;
            $cartItem->save();

            $cartItem->load([
                'productVariant.product'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã cập nhật số lượng.',
                'data' => $cartItem,
            ], 200);
        });
    }

    /**
     * 4. Xóa sản phẩm khỏi giỏ
     */
    public function remove(Request $request, int $id)
    {
        $user = $request->user();

        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm trong giỏ hàng.',
            ], 404);
        }

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa sản phẩm khỏi giỏ hàng.',
        ], 200);
    }
}