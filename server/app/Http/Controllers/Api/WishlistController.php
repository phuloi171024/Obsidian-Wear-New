<?php

namespace App\Http\Controllers\Api;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    // 1. Lấy danh sách sản phẩm yêu thích của user đang đăng nhập
    public function index(Request $request)
    {
        $wishlist = Wishlist::with('product')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json([
            'status' => true,
            'data' => $wishlist
        ], 200);
    }

    // 2. Thêm hoặc Xóa sản phẩm khỏi danh sách yêu thích (Thao tác bấm thả tim)
    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = $request->user()->id;
        $productId = $request->product_id;

        $favorite = Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($favorite) {
            // Nếu đã yêu thích rồi -> Xóa khỏi Wishlist
            $favorite->delete();
            return response()->json([
                'status' => true,
                'is_favorite' => false,
                'message' => 'Đã xóa sản phẩm khỏi danh sách yêu thích!'
            ], 200);
        } else {
            // Nếu chưa -> Thêm vào Wishlist
            Wishlist::create([
                'user_id' => $userId,
                'product_id' => $productId,
            ]);
            return response()->json([
                'status' => true,
                'is_favorite' => true,
                'message' => 'Đã thêm sản phẩm vào danh sách yêu thích!'
            ], 201);
        }
    }
}