<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * 1. Dữ liệu Trang chủ (Sản phẩm mới nhất & Danh mục)
     */
    public function home()
    {
        $newestProducts = Product::with(['category', 'brand', 'images', 'variants'])
            ->where('status', true)
            ->latest()
            ->take(8)
            ->get();

        // [THÊM MỚI]: Lấy sản phẩm bán chạy (Tạm dùng inRandomOrder để giả lập)
        $bestSellingProducts = Product::with(['category', 'brand', 'images', 'variants'])
            ->where('status', true)
            ->inRandomOrder()
            ->take(8)
            ->get();

        $featuredCategories = Category::where('status', true)->take(6)->get();

        return response()->json([
            'status' => true,
            'data' => [
                'newest_products' => $newestProducts,
                // [THÊM MỚI]: Gửi thêm dữ liệu bán chạy ra cho Frontend
                'best_selling_products' => $bestSellingProducts,
                'featured_categories' => $featuredCategories,
            ]
        ], 200);
    }

    /**
     * 2. Lấy danh sách sản phẩm, Tìm kiếm từ khóa & Bộ lọc đa chiều
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'images', 'variants'])
            ->where('status', true);

        // A. Tìm kiếm theo từ khóa
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhereHas('brand', function ($b) use ($search) {
                      $b->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // B. LỌC THEO DANH MỤC: Bổ sung lọc theo tên chữ (Áo, Quần, Giày, Túi) từ React gửi lên
        if ($request->has('category') && !empty($request->category)) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', $request->category);
            });
        }
        // Giữ lại lọc theo category_id phòng hờ sau này cần dùng
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        // C. Lọc theo Thương hiệu
        if ($request->has('brand_ids') && !empty($request->brand_ids)) {
            // Frontend gửi chuỗi "1,2,3" -> cần tách ra thành mảng [1,2,3]
            $brandIds = explode(',', $request->brand_ids);
            $query->whereIn('brand_id', $brandIds);
        } elseif ($request->has('brand_id') && !empty($request->brand_id)) {
            $query->where('brand_id', $request->brand_id);
        }

        // D. Lọc theo Khoảng giá
        if ($request->has('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', $request->max_price);
        }

        // E. Lọc theo Size hoặc Màu sắc
        if ($request->has('size') || $request->has('color')) {
            $query->whereHas('variants', function ($v) use ($request) {
                if ($request->has('size') && !empty($request->size)) {
                    $v->where('size', $request->size);
                }
                if ($request->has('color') && !empty($request->color)) {
                    $v->where('color', $request->color);
                }
            });
        }

        // F. Sắp xếp
        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'latest':
                default:
                    $query->latest();
                    break;
            }
        } else {
            $query->latest();
        }

        // G. TRẢ VỀ MẢNG DỮ LIỆU THẲNG THAY VÌ PHÂN TRANG OBJECT
        // Đổi từ paginate() sang get() để React đếm .length > 0 dễ dàng
        $products = $query->get();

        return response()->json([
            'status' => true,
            'data' => $products
        ], 200);
    }

    /**
     * 3. Xem chi tiết 1 sản phẩm
     */
    public function show( int $id)
    {
        $product = Product::with(['category', 'brand', 'images', 'variants'])
            ->where('status', true)
            ->find($id);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Sản phẩm không tồn tại hoặc đã bị ẩn!'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $product
        ], 200);
    }
}