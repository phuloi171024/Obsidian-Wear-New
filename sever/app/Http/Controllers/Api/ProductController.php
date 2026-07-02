<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Lấy danh sách sản phẩm kèm danh mục và thương hiệu
    public function index()
    {
        $products = Product::with(['category', 'brand', 'variants', 'images'])->get();
        return response()->json($products);
    }

    // Xem chi tiết sản phẩm
    public function show($id)
    {
        $product = Product::with(['category', 'brand', 'variants', 'images'])->findOrFail($id);
        return response()->json($product);
    }
}
