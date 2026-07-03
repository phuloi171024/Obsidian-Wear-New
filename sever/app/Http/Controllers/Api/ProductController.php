<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Lấy danh sách sản phẩm có filter, search và phân trang
     *
     * Query params:
     *   - category_id  : lọc theo danh mục
     *   - brand_id     : lọc theo thương hiệu
     *   - search       : tìm kiếm theo tên sản phẩm
     *   - min_price    : giá từ
     *   - max_price    : giá đến
     *   - sort         : price_asc | price_desc | newest | oldest
     *   - per_page     : số item mỗi trang (mặc định 12)
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'variants', 'images'])
            ->where('status', true);

        // Lọc theo danh mục
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Lọc theo thương hiệu
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // Tìm kiếm theo tên
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Lọc theo khoảng giá
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sắp xếp
        switch ($request->get('sort', 'newest')) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $perPage = min((int) $request->get('per_page', 12), 50); // tối đa 50
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    // Xem chi tiết sản phẩm kèm đánh giá
    public function show($id)
    {
        $product = Product::with([
            'category',
            'brand',
            'variants',
            'images',
            'reviews.user',
        ])->where('status', true)->findOrFail($id);

        return response()->json($product);
    }
}
