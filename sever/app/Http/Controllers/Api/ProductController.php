<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Resources\ProductResource;       // Resource cho danh sách
use App\Http\Resources\ProductDetailResource; // Resource cho chi tiết

class ProductController extends Controller
{
    // Lấy danh sách sản phẩm (Dùng Resource gọn nhẹ)
    public function index()
    {
        // Chỉ lấy những thứ cần thiết để list load nhanh
        $products = Product::with(['category', 'brand', 'images'])->get();
        return ProductResource::collection($products);
    }

    // Xem chi tiết sản phẩm
    public function show( int $id)
    {
        // Eager loading đầy đủ các quan hệ, bao gồm cả đánh giá và thông tin người đánh giá
        $product = Product::with(['category', 'brand', 'variants', 'images', 'reviews.user'])
            ->findOrFail($id);
            
        // Dùng Resource để bọc dữ liệu, giúp format JSON chuẩn đẹp
        return new ProductDetailResource($product);
    }
}