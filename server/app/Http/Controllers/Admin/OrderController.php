<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use RuntimeException;
use Throwable;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {
    }

    /**
     * Danh sách đơn hàng.
     */
    public function index(Request $request)
    {
        $query = Order::query()
            ->with([
                'user',
                'address',
                'items.productVariant.product.images',
                'coupon',
                'orderCoupons.coupon',
            ])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($orderQuery) use ($search) {
                $orderQuery
                    ->where('id', $search)
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate(
                'created_at',
                '>=',
                $request->input('date_from')
            );
        }

        if ($request->filled('date_to')) {
            $query->whereDate(
                'created_at',
                '<=',
                $request->input('date_to')
            );
        }

        $perPage = max(
            1,
            min((int) $request->input('per_page', 15), 100)
        );

        return response()->json(
            $query->paginate($perPage)
        );
    }

    /**
     * Chi tiết đơn hàng.
     */
    public function show(int $id)
    {
        $order = Order::query()
            ->with([
                'user',
                'address',
                'items.productVariant.product.images',
                'coupon',
                'orderCoupons.coupon',
            ])
            ->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Cập nhật trạng thái đơn hàng.
     */
    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'pending',
                    'shipped',
                    'completed',
                    'cancelled',
                ]),
            ],
        ]);

        try {
            $order = $this->orderService->updateStatus(
                $id,
                $validated['status']
            );

            $order->load([
                'user',
                'address',
                'items.productVariant.product.images',
                'coupon',
                'orderCoupons.coupon',
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật trạng thái đơn hàng thành công!',
                'order' => $order,
            ]);
        } catch (ModelNotFoundException) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng!',
            ], 404);
        } catch (RuntimeException $exception) {
            return response()->json([
                'status' => false,
                'message' => $exception->getMessage(),
            ], 422);
        } catch (Throwable $exception) {
            Log::error('Admin cập nhật trạng thái đơn thất bại', [
                'order_id' => $id,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật đơn hàng!',
            ], 500);
        }
    }
}
