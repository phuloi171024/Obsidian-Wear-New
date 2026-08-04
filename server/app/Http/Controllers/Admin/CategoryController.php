<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Danh sách tất cả danh mục (kể cả đã ẩn)
     * GET /admin/categories
     */
    public function index()
    {
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    /**
     * Tạo danh mục mới
     * POST /admin/categories
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'   => 'required|string|max:255|unique:categories,name',
            'status' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = Category::create([
            'name'   => $request->name,
            'slug'   => Str::slug($request->name),
            'status' => $request->get('status', true),
        ]);

        return response()->json([
            'message'  => 'Tạo danh mục thành công!',
            'category' => $category,
        ], 201);
    }

    /**
     * Chi tiết danh mục
     * GET /admin/categories/{id}
     */
    public function show($id)
    {
        $category = Category::withCount('products')->findOrFail($id);
        return response()->json($category);
    }

    /**
     * Cập nhật danh mục
     * PUT /admin/categories/{id}
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'   => 'sometimes|string|max:255|unique:categories,name,' . $category->id,
            'status' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->filled('name')) {
            $request->merge(['slug' => Str::slug($request->name)]);
        }

        $category->update($request->only('name', 'slug', 'status'));

        return response()->json([
            'message'  => 'Cập nhật danh mục thành công!',
            'category' => $category,
        ]);
    }

    /**
     * Xoá danh mục
     * DELETE /admin/categories/{id}
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => 'Không thể xoá danh mục đang có sản phẩm!',
            ], 400);
        }

        $category->delete();

        return response()->json(['message' => 'Đã xoá danh mục thành công!']);
    }
}
