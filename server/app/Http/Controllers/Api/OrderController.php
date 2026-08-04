<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // Lấy danh sách đơn hàng của user đang đăng nhập
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Giả sử bảng orders có cột user_id liên kết với user
        // Nếu trong DB của em chưa có bảng orders, có thể trả về mảng rỗng tạm thời:
        $orders = []; 
        // Hoặc nếu đã có model Order: $orders = $user->orders()->latest()->get();

        return response()->json([
            'status' => true,
            'orders' => $orders
        ], 200);
    }

    // Tạo đơn hàng mới
    public function store(Request $request)
    {
        return response()->json([
            'status' => true,
            'message' => 'Tạo đơn hàng thành công!'
        ], 201);
    }

    // Xem chi tiết đơn hàng
    public function show(Request $request, $id)
    {
        return response()->json([
            'status' => true,
            'order' => null
        ], 200);
    }

    // Hủy đơn hàng
    public function cancel(Request $request, $id)
    {
        return response()->json([
            'status' => true,
            'message' => 'Hủy đơn hàng thành công!'
        ], 200);
    }
}