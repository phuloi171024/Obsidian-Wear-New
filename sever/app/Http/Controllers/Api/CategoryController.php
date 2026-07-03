<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    // Lấy danh sách tất cả danh mục đang hoạt động
    public function index()
    {
        $categories = Category::where('status', true)
            ->withCount('products')
            ->get();

        return response()->json($categories);
    }

    // Xem chi tiết danh mục + danh sách sản phẩm thuộc danh mục
    public function show($id)
    {
        $category = Category::where('status', true)
            ->with(['products' => function ($query) {
                $query->where('status', true)
                      ->with(['images', 'variants'])
                      ->paginate(12);
            }])
            ->findOrFail($id);

        return response()->json($category);
    }
}
