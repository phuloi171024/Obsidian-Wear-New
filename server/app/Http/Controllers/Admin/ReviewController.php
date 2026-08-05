<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Danh sách tất cả đánh giá
     * GET /admin/reviews
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

        $perPage = min((int) $request->get('per_page', 20), 100);

        return response()->json($query->paginate($perPage));
    }

    /**
     * Duyệt đánh giá (chuyển sang approved)
     * PUT /admin/reviews/{id}/approve
     */
    public function approve($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Đã duyệt đánh giá thành công!',
            'review'  => $review,
        ]);
    }

    /**
     * Ẩn đánh giá (chuyển sang hidden)
     * PUT /admin/reviews/{id}/hide
     */
    public function hide($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['status' => 'hidden']);

        return response()->json([
            'message' => 'Đã ẩn đánh giá thành công!',
            'review'  => $review,
        ]);
    }

    /**
     * Xoá đánh giá (soft delete)
     * DELETE /admin/reviews/{id}
     */
    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Đã xoá đánh giá thành công!']);
    }
}
