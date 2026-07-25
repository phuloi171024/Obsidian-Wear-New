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
        $validator = Validator::make($request->all(), [
            'code'           => 'required|string|max:50|unique:coupons,code',
            'discount_value' => 'required|numeric|min:0',
            'end_date'       => 'nullable|date|after:today',
            'status'         => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $coupon = Coupon::create([
            'code'           => strtoupper($request->code),
            'discount_value' => $request->discount_value,
            'end_date'       => $request->end_date,
            'status'         => $request->get('status', true),
        ]);

        return response()->json([
            'message' => 'Tạo mã giảm giá thành công!',
            'coupon'  => $coupon,
        ], 201);
    }

    /**
     * Chi tiết coupon
     * GET /admin/coupons/{id}
     */
    public function show($id)
    {
        $coupon = Coupon::withCount('orders')->findOrFail($id);
        return response()->json($coupon);
    }

    /**
     * Cập nhật coupon
     * PUT /admin/coupons/{id}
     */
    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code'           => 'sometimes|string|max:50|unique:coupons,code,' . $coupon->id,
            'discount_value' => 'sometimes|numeric|min:0',
            'end_date'       => 'nullable|date',
            'status'         => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->filled('code')) {
            $request->merge(['code' => strtoupper($request->code)]);
        }

        $coupon->update($request->only('code', 'discount_value', 'end_date', 'status'));

        return response()->json([
            'message' => 'Cập nhật mã giảm giá thành công!',
            'coupon'  => $coupon,
        ]);
    }

    /**
     * Xoá coupon
     * DELETE /admin/coupons/{id}
     */
    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json(['message' => 'Đã xoá mã giảm giá thành công!']);
    }
}
