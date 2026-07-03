<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;

class BrandController extends Controller
{
    // Lấy danh sách tất cả thương hiệu đang hoạt động
    public function index()
    {
        $brands = Brand::where('status', true)
            ->withCount('products')
            ->get();

        return response()->json($brands);
    }

    // Xem chi tiết thương hiệu + danh sách sản phẩm thuộc thương hiệu
    public function show($id)
    {
        $brand = Brand::where('status', true)
            ->findOrFail($id);

        $products = $brand->products()
            ->where('status', true)
            ->with(['images', 'variants', 'category'])
            ->paginate(12);

        return response()->json([
            'brand'    => $brand,
            'products' => $products,
        ]);
    }
}
