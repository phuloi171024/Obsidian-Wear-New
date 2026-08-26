<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Danh sách tất cả đánh giá cho trang Admin
     * GET /api/admin/reviews
     */
    public function index(Request $request)
    {
        $query = Review::with(['user', 'product'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('comment', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', '%' . $request->search . '%'));
            });
        }

        $perPage = min((int) $request->get('per_page', 50), 100);

        $topProduct = Review::query()
            ->select('product_id', DB::raw('COUNT(*) as total'))
            ->with('product:id,name')
            ->groupBy('product_id')
            ->orderByDesc('total')
            ->first();

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'stats' => [
                'total' => Review::count(),
                'today' => Review::whereDate('created_at', today())->count(),
                'pending' => Review::whereIn(
                    'status',
                    ['pending', 'hidden']
                )->count(),
                'top_product' => $topProduct?->product?->name ?? 'Chưa có',
                'top_count' => (int) ($topProduct?->total ?? 0),
            ],
        ]);
    }

    /**
     * Duyệt đánh giá
     * PUT /api/admin/reviews/{id}/approve
     */
    public function approve(int $id)
    {
        $review = Review::findOrFail($id);
        $review->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Đã duyệt đánh giá thành công!',
            'review'  => $review,
        ]);
    }

    /**
     * Ẩn đánh giá
     * PUT /api/admin/reviews/{id}/hide
     */
    public function hide(int $id)
    {
        $review = Review::findOrFail($id);

        // Nếu bình luận đang bị ẩn -> Chuyển về trạng thái chờ duyệt (pending)
        if ($review->status === 'hidden') {
            $review->update(['status' => 'pending']);
            $message = 'Đã khôi phục bình luận về trạng thái chờ duyệt!';
        } 
        // Nếu bình luận đang bình thường -> Chuyển sang ẩn (hidden)
        else {
            $review->update(['status' => 'hidden']);
            $message = 'Đã ẩn bình luận thành công!';
        }

        return response()->json([
            'message' => $message,
            'review'  => $review,
        ]);
    }
    /**
     * Xoá đánh giá
     * DELETE /api/admin/reviews/{id}
     */
    public function destroy(int $id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Đã xoá đánh giá thành công!']);
    }
}
