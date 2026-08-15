<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // Cập nhật lại chuỗi trạng thái cho đúng khớp 100% với ENUM trong Database của em
    const STATUS_FLOW = [
        'pending'   => ['shipped', 'cancelled'],
        'shipped'   => ['completed', 'cancelled'],
        'completed' => [],
        'cancelled' => [],
    ];

    /**
     * Danh sách TẤT CẢ đơn hàng (của mọi user)
     */
    public function index(Request $request)
    {
        // SỬA LỖI: Đổi 'items.variant' thành 'items.productVariant'
        $query = Order::with(['user', 'items.productVariant.product.images', 'coupon'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = min((int) $request->get('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    /**
     * Chi tiết 1 đơn hàng
     */
    public function show( int $id)
    {
        // SỬA LỖI: Đổi 'items.variant' thành 'items.productVariant'
        $order = Order::with([
            'user',
            'items.productVariant.product.images',
            'coupon',
        ])->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    public function updateStatus(Request $request, int $id)
    {
        $order = Order::findOrFail($id);

        // Cập nhật validate cho đúng với Enum Database
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,shipped,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $allowedNext = self::STATUS_FLOW[$order->status] ?? [];

        if (!in_array($request->status, $allowedNext)) {
            return response()->json([
                'message' => "Không thể chuyển từ '{$order->status}' sang '{$request->status}'!",
                'allowed' => $allowedNext,
            ], 400);
        }

        $order->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Cập nhật trạng thái đơn hàng thành công!',
            'order'   => $order->load(['user', 'items.productVariant.product', 'coupon']),
        ]);
    }
}