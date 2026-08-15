<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Order;

class ReviewController extends Controller
{
    // 1. Lấy danh sách đánh giá của 1 sản phẩm để hiển thị lên ReactJS
    public function index(int $productId)
    {
        $reviews = Review::with('user:id,name')
            ->where('product_id', $productId)
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedReviews = $reviews->map(function($r) {
            return [
                'id' => $r->id,
                'name' => $r->user ? $r->user->name : 'Khách hàng',
                'rating' => $r->rating,
                'comment' => $r->comment,
                'date' => $r->created_at->format('d/m/Y')
            ];
        });

        return response()->json([
            'status' => true,
            'data' => $formattedReviews
        ], 200);
    }

    // 2. Thêm đánh giá mới
    public function store(Request $request, int $productId)
    {
        $user = $request->user();

        // KIỂM TRA NGOẠI LỆ: User đã mua sản phẩm này và đơn hàng đã "completed" (Hoàn tất) chưa?
        $hasBought = Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereHas('items.productVariant', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })->exists();

        if (!$hasBought) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn phải mua và nhận hàng thành công mới được đánh giá sản phẩm này!'
            ], 403);
        }

        // Tạo đánh giá lưu vào database
        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $productId,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'status' => 'pending', // Mặc định là chờ duyệt
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Cảm ơn bạn đã gửi đánh giá!',
            'review' => [
                'id' => $review->id,
                'name' => $user->name,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'date' => $review->created_at->format('d/m/Y')
            ]
        ], 201);
    }

    // 3. Khách hàng báo cáo bình luận rác
    public function report(int $id)
    {
        $review = Review::findOrFail($id);
        
        // Tăng số lượt báo cáo lên 1
        $review->increment('report_count');

        return response()->json([
            'status' => true,
            'message' => 'Cảm ơn bạn đã báo cáo. Quản trị viên sẽ kiểm tra bình luận này!'
        ]);
    }
}