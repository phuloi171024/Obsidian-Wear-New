<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Danh sách tất cả sản phẩm (kể cả đã ẩn)
     * GET /admin/products
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'variants', 'images']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status === 'active');
        }

        $query->orderBy('created_at', 'desc');
        $perPage = min((int) $request->get('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    /**
     * Tạo sản phẩm mới
     * POST /admin/products
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'brand_id'    => 'required|exists:brands,id',
            'price'       => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status'      => 'boolean',
            'thumbnail'   => 'nullable|string',
            'sku'         => 'nullable|string|unique:products,sku',
            'variants'    => 'nullable|array',
            'variants.*.size'   => 'required_with:variants|string',
            'variants.*.color'  => 'required_with:variants|string',
            'variants.*.stock'  => 'required_with:variants|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $slug = Str::slug($request->name) . '-' . Str::random(6);

        $product = Product::create([
            'name'        => $request->name,
            'slug'        => $slug,
            'sku'         => $request->sku ?? strtoupper(Str::random(8)),
            'category_id' => $request->category_id,
            'brand_id'    => $request->brand_id,
            'price'       => $request->price,
            'description' => $request->description,
            'thumbnail'   => $request->thumbnail,
            'status'      => $request->get('status', true),
        ]);

        // Tạo variants nếu có
        if ($request->filled('variants')) {
            foreach ($request->variants as $variant) {
                $product->variants()->create([
                    'size'  => $variant['size'],
                    'color' => $variant['color'],
                    'stock' => $variant['stock'],
                ]);
            }
        }

        return response()->json([
            'message' => 'Tạo sản phẩm thành công!',
            'product' => $product->load(['category', 'brand', 'variants', 'images']),
        ], 201);
    }

    /**
     * Chi tiết sản phẩm
     * GET /admin/products/{id}
     */
    public function show(int $id)
    {
        $product = Product::withTrashed()
            ->with(['category', 'brand', 'variants', 'images', 'reviews.user'])
            ->findOrFail($id);

        return response()->json($product);
    }

    /**
     * Cập nhật sản phẩm
     * PUT /admin/products/{id}
     */
    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'brand_id'    => 'sometimes|exists:brands,id',
            'price'       => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'status'      => 'sometimes|boolean',
            'thumbnail'   => 'nullable|string',
            'sku'         => 'nullable|string|unique:products,sku,' . $product->id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Cập nhật slug nếu đổi tên
        if ($request->filled('name') && $request->name !== $product->name) {
            $request->merge(['slug' => Str::slug($request->name) . '-' . Str::random(6)]);
        }

        $product->update($request->only([
            'name', 'slug', 'sku', 'category_id', 'brand_id',
            'price', 'description', 'thumbnail', 'status',
        ]));

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công!',
            'product' => $product->load(['category', 'brand', 'variants', 'images']),
        ]);
    }

    /**
     * Xoá mềm sản phẩm
     * DELETE /admin/products/{id}
     */
    public function destroy( int $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Đã xoá sản phẩm thành công!']);
    }

    /**
     * Thêm ảnh chi tiết cho sản phẩm
     * POST /admin/products/{id}/images
     */
    public function uploadImages(Request $request,int $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'images'         => 'required|array|min:1',
            'images.*'       => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->images as $imageUrl) {
            $product->images()->create(['image_path' => $imageUrl]);
        }

        return response()->json([
            'message' => 'Thêm ảnh thành công!',
            'images'  => $product->images,
        ]);
    }

    /**
     * Xoá ảnh chi tiết của sản phẩm
     * DELETE /admin/products/{id}/images/{imageId}
     */
    public function deleteImage( int $id, int $imageId)
    {
        $image = ProductImage::where('product_id', $id)->findOrFail($imageId);
        $image->delete();

        return response()->json(['message' => 'Đã xoá ảnh!']);
    }

    /**
     * Thêm biến thể mới cho sản phẩm (Hàm chuẩn phục vụ API thêm biến thể)
     * POST /admin/products/{id}/variants
     */
    public function addVariant(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'color' => 'required|string|max:255',
            'size'  => 'required|string|max:255',
            'stock' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'color'      => $request->color,
            'size'       => $request->size,
            'stock'      => $request->stock,
        ]);

        return response()->json([
            'message' => 'Thêm biến thể thành công!',
            'variant' => $variant
        ], 201);
    }

    /**
     * Cập nhật stock của variant
     * PUT /admin/products/{id}/variants/{variantId}
     */
    public function updateVariant(Request $request, int $id, int $variantId)
    {
        $variant = ProductVariant::where('product_id', $id)->findOrFail($variantId);

        $validator = Validator::make($request->all(), [
            'size'  => 'sometimes|string',
            'color' => 'sometimes|string',
            'stock' => 'sometimes|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $variant->update($request->only('size', 'color', 'stock'));

        return response()->json([
            'message' => 'Cập nhật biến thể thành công!',
            'variant' => $variant,
        ]);
    }

    /**
     * Xoá variant
     * DELETE /admin/products/{id}/variants/{variantId}
     */
    public function deleteVariant(int $id, int $variantId)
    {
        $variant = ProductVariant::where('product_id', $id)->findOrFail($variantId);
        $variant->delete();

        return response()->json(['message' => 'Đã xoá biến thể!']);
    }
}