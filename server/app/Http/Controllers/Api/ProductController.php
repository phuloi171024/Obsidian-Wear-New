<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class ProductController extends Controller
{
    public function categories()
    {
        $categories = Category::query()
            ->where('status', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $categories,
        ]);
    }

    private function activeSaleQuery(Builder $query): Builder
    {
        return $query
            ->whereNotNull('sale_price')
            ->whereColumn('sale_price', '<', 'price')
            ->where(function (Builder $dateQuery) {
                $dateQuery
                    ->whereNull('sale_starts_at')
                    ->orWhere('sale_starts_at', '<=', now());
            })
            ->where(function (Builder $dateQuery) {
                $dateQuery
                    ->whereNull('sale_ends_at')
                    ->orWhere('sale_ends_at', '>=', now());
            });
    }

    /**
     * 1. Dữ liệu động cho trang chủ.
     */
    public function home()
    {
        $relations = ['category', 'brand', 'images', 'variants'];

        $newestProducts = Product::with($relations)
            ->where('status', true)
            ->latest()
            ->take(8)
            ->get();

        $bestSellingProducts = Product::with($relations)
            ->where('products.status', true)
            ->select('products.*')
            ->addSelect(DB::raw('(
                SELECT COALESCE(SUM(oi.quantity), 0)
                FROM order_items oi
                JOIN product_variants pv ON pv.id = oi.product_variant_id
                JOIN orders o ON o.id = oi.order_id
                WHERE pv.product_id = products.id 
                AND o.status = "completed"
            ) as total_sold'))
            ->orderByDesc('total_sold')
            ->latest()
            ->take(8)
            ->get();

        $featuredProducts = Product::with($relations)
            ->where('status', true)
            ->where('is_featured', true)
            ->latest()
            ->take(8)
            ->get();

        $sportLabels = [
            'tennis-pickleball' => 'Tennis & Pickleball',
            'running' => 'Chạy Bộ',
            'swimming' => 'Bơi Lội',
            'football' => 'Bóng Đá',
            'gym' => 'Gym',
        ];

        $sportSections = collect($sportLabels)
            ->map(function (string $label, string $key) use ($relations) {
                return [
                    'key' => $key,
                    'label' => $label,
                    'products' => Product::with($relations)
                        ->where('status', true)
                        ->where('sport_type', $key)
                        ->latest()
                        ->take(8)
                        ->get(),
                ];
            })
            ->values();

        $dealProductsQuery = Product::with($relations)
            ->where('status', true);
        $dealProducts = $this->activeSaleQuery($dealProductsQuery)
            ->orderByRaw('((price - sale_price) / NULLIF(price, 0)) DESC')
            ->latest()
            ->take(40)
            ->get();

        $deals = $dealProducts
            ->groupBy(fn (Product $product) => $product->deal_label ?: 'Ưu đãi hiện tại')
            ->map(fn ($products, string $label) => [
                'key' => str($label)->slug()->toString(),
                'label' => $label,
                'products' => $products->take(8)->values(),
            ])
            ->values();

        $featuredCategories = Category::query()
            ->where('status', true)
            ->withCount(['products' => fn ($query) => $query->where('status', true)])
            ->orderByDesc('products_count')
            ->take(6)
            ->get();

        $featuredBrands = Brand::query()
    ->where('status', true)
    ->where('is_featured', true)
    ->orderBy('name')
    ->take(8)
    ->get();

        return response()->json([
            'status' => true,
            'data' => [
                'newest_products' => $newestProducts,
                'best_selling_products' => $bestSellingProducts,
                'featured_products' => $featuredProducts,
                'featured_categories' => $featuredCategories,
                'sport_sections' => $sportSections,
                'deals' => $deals,
                'featured_brands' => $featuredBrands,
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

        if ($request->filled('sport_type')) {
            $query->where('sport_type', $request->sport_type);
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->boolean('on_sale')) {
            $this->activeSaleQuery($query);
        }

        if ($request->filled('deal_label')) {
            $query->where('deal_label', $request->deal_label);
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

        $perPage = max(
            1,
            min((int) $request->input('per_page', 24), 100)
        );
        $products = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'status' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
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
