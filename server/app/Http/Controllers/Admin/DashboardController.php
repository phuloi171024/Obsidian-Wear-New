<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Trả về thống kê tổng hợp cho Dashboard và Statistics admin
     * GET /admin/dashboard?filter=month|week|year
     */
    public function index(Request $request)
    {
        $filter = $request->get('filter', 'month'); // Mặc định là tháng này
        $now = Carbon::now();

        // Xác định khoảng thời gian dựa vào tiêu chí lựa chọn
        if ($filter === 'week') {
            $startDate = $now->copy()->startOfWeek();
            $endDate = $now->copy()->endOfWeek();
            $lastStartDate = $now->copy()->subWeek()->startOfWeek();
            $lastEndDate = $now->copy()->subWeek()->endOfWeek();
        } elseif ($filter === 'year') {
            $startDate = $now->copy()->startOfYear();
            $endDate = $now->copy()->endOfYear();
            $lastStartDate = $now->copy()->subYear()->startOfYear();
            $lastEndDate = $now->copy()->subYear()->endOfYear();
        } else { // 'month'
            $startDate = $now->copy()->startOfMonth();
            $endDate = $now->copy()->endOfMonth();
            $lastStartDate = $now->copy()->subMonth()->startOfMonth();
            $lastEndDate = $now->copy()->subMonth()->endOfMonth();
        }

        // ── Doanh thu ──────────────────────────────────────────────────────────
        $revenueThisPeriod = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        $revenueLastPeriod = Order::where('status', 'completed')
            ->whereBetween('created_at', [$lastStartDate, $lastEndDate])
            ->sum('total_amount');

        $revenueGrowth = $revenueLastPeriod > 0
            ? round((($revenueThisPeriod - $revenueLastPeriod) / $revenueLastPeriod) * 100, 1)
            : 0;

        // ── Đơn hàng ───────────────────────────────────────────────────────────
        $orderStats = Order::whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
        $totalOrdersLastPeriod = Order::whereBetween('created_at', [$lastStartDate, $lastEndDate])->count();
        
        $orderGrowth = $totalOrdersLastPeriod > 0
            ? round((($totalOrders - $totalOrdersLastPeriod) / $totalOrdersLastPeriod) * 100, 1)
            : 0;

        // ── Người dùng ─────────────────────────────────────────────────────────
        $totalUsers = User::where('role', 'user')->count();

        $newUsersThisPeriod = User::where('role', 'user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // ── Sản phẩm ───────────────────────────────────────────────────────────
        $totalProducts = Product::count();
        $activeProducts = Product::where('status', true)->count();

        // ── Top 5 sản phẩm bán chạy trong khoảng thời gian ─────────────────────
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.product_variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', 'completed')
            ->whereNull('order_items.deleted_at')
            ->whereNull('product_variants.deleted_at')
            ->whereNull('products.deleted_at')
            ->select(
                'products.id',
                'products.name',
                'products.thumbnail',
                'products.price',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.thumbnail', 'products.price')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // ── Biểu đồ 7 ngày gần nhất (hoặc theo khung thời gian) ────────────────
        $last7Days = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::now()->subDays($daysAgo);
            $revenue = Order::where('status', 'completed')
                ->whereDate('created_at', $date->toDateString())
                ->sum('total_amount');
            $ordersCount = Order::whereDate('created_at', $date->toDateString())->count();

            return [
                'day'     => $date->format('d/m'),
                'revenue' => (float) $revenue,
                'orders'  => $ordersCount,
            ];
        });

        return response()->json([
            'revenue' => [
                'current' => (float) $revenueThisPeriod,
                'growth'  => $revenueGrowth,
            ],
            'orders' => [
                'total'     => $totalOrders,
                'growth'    => $orderGrowth,
                'by_status' => $orderStats,
            ],
            'users' => [
                'total'           => $totalUsers,
                'new_this_period' => $newUsersThisPeriod,
            ],
            'products' => [
                'total'  => $totalProducts,
                'active' => $activeProducts,
            ],
            'top_products'  => $topProducts,
            'revenue_chart' => $last7Days,
        ]);
    }
}