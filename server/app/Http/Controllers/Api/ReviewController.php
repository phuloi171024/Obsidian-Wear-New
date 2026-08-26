<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Danh sách đánh giá đã được admin duyệt.
     */
    public function index(int $productId)
    {
        $reviews = Review::query()
            ->with('user:id,name')
            ->where('product_id', $productId)
            ->where('status', 'approved')
            ->latest()
            ->get();

        $formattedReviews = $reviews->map(function (Review $review) {
            return [
                'id' => $review->id,
                'name' => $review->user?->name ?? 'Khách hàng',
                'rating' => $review->rating,
                'comment' => $review->comment,
                'date' => $review->created_at->format('d/m/Y'),
            ];
        });

        return response()->json([
            'status' => true,
            'data' => $formattedReviews,
        ]);
    }

    /**
     * Gửi đánh giá mới.
     */
    public function store(Request $request, int $productId)
    {
        $validated = $request->validate([
            'rating' => [
                'required',
                'integer',
                'between:1,5',
            ],
            'comment' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $user = $request->user();

        $productExists = Product::query()
            ->where('id', $productId)
            ->where('status', true)
            ->exists();

        if (!$productExists) {
            return response()->json([
                'status' => false,
                'message' => 'Sản phẩm không tồn tại hoặc đã bị ẩn!',
            ], 404);
        }

        /*
         * Kiểm tra lịch sử mua hàng trực tiếp bằng ID.
         * Cách này vẫn hoạt động khi biến thể cũ đã bị xóa mềm.
         */
        $hasBought = DB::table('orders')
            ->join(
                'order_items',
                'orders.id',
                '=',
                'order_items.order_id'
            )
            ->join(
                'product_variants',
                'order_items.product_variant_id',
                '=',
                'product_variants.id'
            )
            ->where('orders.user_id', $user->id)
            ->where('orders.status', 'completed')
            ->where('product_variants.product_id', $productId)
            ->whereNull('orders.deleted_at')
            ->whereNull('order_items.deleted_at')
            ->exists();

        if (!$hasBought) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn phải mua và nhận hàng thành công mới được đánh giá sản phẩm này!',
            ], 403);
        }

        $alreadyReviewed = Review::query()
            ->where('user_id', $user->id)
            ->where('product_id', $productId)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn đã đánh giá sản phẩm này rồi!',
            ], 422);
        }

        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $productId,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'status' => 'pending',
            'report_count' => 0,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Đánh giá đã được gửi và đang chờ quản trị viên duyệt.',
            'review' => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'status' => $review->status,
            ],
        ], 201);
    }

    /**
     * Báo cáo một đánh giá đã được duyệt.
     */
    public function report(Request $request, int $id)
    {
        $review = Review::query()
            ->where('status', 'approved')
            ->findOrFail($id);

        $cacheKey = sprintf(
            'review_report:%d:%d',
            $request->user()->id,
            $review->id
        );

        /*
         * Cache::add chỉ thành công khi key chưa tồn tại.
         * Một tài khoản chỉ báo cáo một review trong 24 giờ.
         */
        $firstReport = Cache::add(
            $cacheKey,
            true,
            now()->addDay()
        );

        if (!$firstReport) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn đã báo cáo đánh giá này rồi!',
            ], 422);
        }

        $review->increment('report_count');

        return response()->json([
            'status' => true,
            'message' => 'Cảm ơn bạn đã báo cáo. Quản trị viên sẽ kiểm tra đánh giá này!',
        ]);
    }
}