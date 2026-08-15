<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CouponController extends Controller
{
    /**
     * Danh sách tất cả coupon
     * GET /admin/coupons
     */
    public function index(Request $request)
    {
        $query = Coupon::withCount('orders')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status === 'active');
        }

        if ($request->filled('search')) {
            $query->where('code', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->get());
    }

    /**
     * Tạo mã giảm giá mới
     * POST /admin/coupons
     */
    public function store(Request $request)
    {
        // Thêm Validator cho đầy đủ các trường từ React gửi lên
        $validator = Validator::make($request->all(), [
            'code'            => 'required|string|max:50|unique:coupons,code',
            'discount_type'   => 'required|string|in:fixed,percent,shipping',
            'discount_value'  => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'usage_limit'     => 'nullable|integer|min:1',
            'expires_at'      => 'nullable|date',
            'status'          => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Tự động in hoa mã code
        if ($request->filled('code')) {
            $request->merge(['code' => strtoupper($request->code)]);
        }

        // Lưu TOÀN BỘ dữ liệu vào Database
        $coupon = Coupon::create($request->all());

        return response()->json([
            'message' => 'Tạo mã giảm giá thành công!',
            'coupon'  => $coupon,
        ], 201);
    }

    /**
     * Chi tiết coupon
     * GET /admin/coupons/{id}
     */
    public function show( int $id)
    {
        $coupon = Coupon::withCount('orders')->findOrFail($id);
        return response()->json($coupon);
    }

    /**
     * Cập nhật coupon
     * PUT /admin/coupons/{id}
     */
    public function update(Request $request, int $id)
    {
        $coupon = Coupon::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code'            => 'sometimes|string|max:50|unique:coupons,code,' . $coupon->id,
            'discount_type'   => 'sometimes|string|in:fixed,percent,shipping',
            'discount_value'  => 'sometimes|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'usage_limit'     => 'nullable|integer|min:1',
            'expires_at'      => 'nullable|date',
            'status'          => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Tự động in hoa mã code
        if ($request->filled('code')) {
            $request->merge(['code' => strtoupper($request->code)]);
        }

        // LƯU Ý: Đã thay $request->only() bằng $request->all() để lưu đủ dữ liệu
        $coupon->update($request->all());

        return response()->json([
            'message' => 'Cập nhật mã giảm giá thành công!',
            'coupon'  => $coupon,
        ]);
    }

    /**
     * Xoá coupon
     * DELETE /admin/coupons/{id}
     */
    public function destroy( int $id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json(['message' => 'Đã xoá mã giảm giá thành công!']);
    }
    /**
     * Xóa nhiều mã giảm giá cùng lúc
     * DELETE /admin/coupons/bulk
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:coupons,id',
        ]);

        Coupon::whereIn('id', $request->ids)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đã xoá các mã giảm giá được chọn thành công!'
        ]);
    }
}