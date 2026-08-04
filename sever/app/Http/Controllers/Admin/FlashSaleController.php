<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class FlashSaleController extends Controller
{
    /**
     * Danh sách tất cả flash sale
     * GET /admin/flash-sales
     */
    public function index(Request $request)
    {
        $query = FlashSale::withCount('products')->latest();

        if ($request->filled('status')) {
            $now = Carbon::now();
            switch ($request->status) {
                case 'active':
                    $query->where('status', true)
                          ->where('start_time', '<=', $now)
                          ->where('end_time', '>=', $now);
                    break;
                case 'upcoming':
                    $query->where('status', true)
                          ->where('start_time', '>', $now);
                    break;
                case 'ended':
                    $query->where('end_time', '<', $now);
                    break;
                case 'disabled':
                    $query->where('status', false);
                    break;
            }
        }

        $flashSales = $query->get()->map(function ($fs) {
            $fs->display_status = $fs->display_status;
            return $fs;
        });

        return response()->json($flashSales);
    }

    /**
     * Chi tiết 1 flash sale kèm danh sách sản phẩm
     * GET /admin/flash-sales/{id}
     */
    public function show($id)
    {
        $flashSale = FlashSale::with(['products' => function ($q) {
            $q->with(['category', 'brand'])
              ->select('products.id', 'products.name', 'products.price', 'products.thumbnail', 'products.sku', 'products.status');
        }])->withCount('products')->findOrFail($id);

        $flashSale->display_status = $flashSale->display_status;

        return response()->json($flashSale);
    }

    /**
     * Tạo flash sale mới
     * POST /admin/flash-sales
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'             => 'required|string|max:255',
            'discount_percent' => 'required|numeric|min:1|max:99',
            'start_time'       => 'required|date|after_or_equal:now',
            'end_time'         => 'required|date|after:start_time',
            'status'           => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $flashSale = FlashSale::create([
            'name'             => $request->name,
            'discount_percent' => $request->discount_percent,
            'start_time'       => $request->start_time,
            'end_time'         => $request->end_time,
            'status'           => $request->get('status', true),
        ]);

        return response()->json([
            'message'    => 'Tạo Flash Sale thành công!',
            'flash_sale' => $flashSale->load('products'),
        ], 201);
    }

    /**
     * Cập nhật flash sale
     * PUT /admin/flash-sales/{id}
     */
    public function update(Request $request, $id)
    {
        $flashSale = FlashSale::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'             => 'sometimes|string|max:255',
            'discount_percent' => 'sometimes|numeric|min:1|max:99',
            'start_time'       => 'sometimes|date',
            'end_time'         => 'sometimes|date|after:start_time',
            'status'           => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $flashSale->update($request->only('name', 'discount_percent', 'start_time', 'end_time', 'status'));

        return response()->json([
            'message'    => 'Cập nhật Flash Sale thành công!',
            'flash_sale' => $flashSale->load('products'),
        ]);
    }

    /**
     * Xoá flash sale
     * DELETE /admin/flash-sales/{id}
     */
    public function destroy($id)
    {
        $flashSale = FlashSale::findOrFail($id);
        $flashSale->delete();

        return response()->json(['message' => 'Đã xoá Flash Sale!']);
    }

    /**
     * Thêm sản phẩm vào flash sale
     * POST /admin/flash-sales/{id}/products
     */
    public function addProducts(Request $request, $id)
    {
        $flashSale = FlashSale::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'product_ids'   => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $syncData = [];
        foreach ($request->product_ids as $pid) {
            $syncData[$pid] = ['discount_percent' => $request->discount_percent ?? null];
        }

        $flashSale->products()->syncWithoutDetaching($syncData);

        return response()->json([
            'message'    => 'Thêm sản phẩm thành công!',
            'flash_sale' => $flashSale->load('products'),
        ]);
    }

    /**
     * Xoá sản phẩm khỏi flash sale
     * DELETE /admin/flash-sales/{id}/products/{productId}
     */
    public function removeProduct($id, $productId)
    {
        $flashSale = FlashSale::findOrFail($id);
        $flashSale->products()->detach($productId);

        return response()->json(['message' => 'Đã xoá sản phẩm khỏi Flash Sale!']);
    }
}
