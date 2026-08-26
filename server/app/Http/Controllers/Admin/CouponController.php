<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

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
        $request->merge([
            'code' => strtoupper(trim((string) $request->input('code'))),
        ]);

        $validator = Validator::make($request->all(), [
            'code'            => 'required|string|max:50|unique:coupons,code',
            'discount_type'   => 'required|string|in:fixed,percent,shipping',
            'discount_value'  => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'usage_limit'     => 'nullable|integer|min:1',
            'expires_at'      => 'nullable|date',
            'end_date'        => 'nullable|date',
            'status'          => 'boolean',
        ], [
            'discount_value.max' => 'Mã phần trăm không được vượt quá 100%.',
        ]);

        $validator->sometimes(
            'discount_value',
            'max:100',
            fn ($input) => $input->discount_type === 'percent'
        );

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $coupon = Coupon::create($validator->validated());

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

        if ($request->has('code')) {
            $request->merge([
                'code' => strtoupper(trim((string) $request->input('code'))),
            ]);
        }

        $validator = Validator::make($request->all(), [
            'code'            => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('coupons', 'code')->ignore($coupon->id),
            ],
            'discount_type'   => 'sometimes|string|in:fixed,percent,shipping',
            'discount_value'  => 'sometimes|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'usage_limit'     => 'nullable|integer|min:1',
            'expires_at'      => 'nullable|date',
            'end_date'        => 'nullable|date',
            'status'          => 'sometimes|boolean',
        ], [
            'discount_value.max' => 'Mã phần trăm không được vượt quá 100%.',
        ]);

        $validator->sometimes(
            'discount_value',
            'max:100',
            fn ($input) => ($input->discount_type ?? $coupon->discount_type) === 'percent'
        );

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $coupon->update($validator->validated());

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
