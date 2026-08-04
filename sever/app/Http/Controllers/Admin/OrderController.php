<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // Thứ tự trạng thái đơn hàng hợp lệ (bao gồm đổi/trả hàng)
    const STATUS_FLOW = [
        'pending'          => ['processing', 'cancelled'],
        'processing'       => ['shipped', 'cancelled'],
        'shipped'          => ['delivered', 'return_requested'],
        'delivered'        => ['return_requested'],
        'cancelled'        => [],
        'return_requested' => ['returned', 'delivered'], // delivered = từ chối hoàn trả
        'returned'         => [],
    ];

    /**
     * Danh sách TẤT CẢ đơn hàng (của mọi user)
     * GET /admin/orders
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.variant.product.images', 'coupon'])
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
     * GET /admin/orders/{id}
     */
    public function show($id)
    {
        $order = Order::with([
            'user',
            'items.variant.product.images',
            'coupon',
        ])->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     * PUT /admin/orders/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled,return_requested,returned',
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
            'order'   => $order->load(['user', 'items.variant.product', 'coupon']),
        ]);
    }
}
