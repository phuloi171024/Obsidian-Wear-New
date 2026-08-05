<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    /**
     * Danh sách tất cả thương hiệu (kể cả đã ẩn)
     * GET /admin/brands
     */
    public function index()
    {
        $brands = Brand::withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json($brands);
    }

    /**
     * Tạo thương hiệu mới
     * POST /admin/brands
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'   => 'required|string|max:255|unique:brands,name',
            'status' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $brand = Brand::create([
            'name'   => $request->name,
            'slug'   => Str::slug($request->name),
            'status' => $request->get('status', true),
        ]);

        return response()->json([
            'message' => 'Tạo thương hiệu thành công!',
            'brand'   => $brand,
        ], 201);
    }

    /**
     * Chi tiết thương hiệu
     * GET /admin/brands/{id}
     */
    public function show($id)
    {
        $brand = Brand::withCount('products')->findOrFail($id);
        return response()->json($brand);
    }

    /**
     * Cập nhật thương hiệu
     * PUT /admin/brands/{id}
     */
    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'   => 'sometimes|string|max:255|unique:brands,name,' . $brand->id,
            'status' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->filled('name')) {
            $request->merge(['slug' => Str::slug($request->name)]);
        }

        $brand->update($request->only('name', 'slug', 'status'));

        return response()->json([
            'message' => 'Cập nhật thương hiệu thành công!',
            'brand'   => $brand,
        ]);
    }

    /**
     * Xoá thương hiệu
     * DELETE /admin/brands/{id}
     */
    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);

        if ($brand->products()->count() > 0) {
            return response()->json([
                'message' => 'Không thể xoá thương hiệu đang có sản phẩm!',
            ], 400);
        }

        $brand->delete();

        return response()->json(['message' => 'Đã xoá thương hiệu thành công!']);
    }
}
