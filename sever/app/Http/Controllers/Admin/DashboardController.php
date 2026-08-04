<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Trả về thống kê tổng hợp cho Dashboard admin
     * GET /admin/dashboard?period=7|30|this_month|last_month
     */
    public function index(Request $request)
    {
        $period = $request->get('period', '7');
        $now    = Carbon::now();

        // Xác định khoảng thời gian theo period
        switch ($period) {
            case '30':
                $dateFrom = $now->copy()->subDays(30)->startOfDay();
                $dateTo   = $now->copy()->endOfDay();
                $chartDays = 30;
                break;
            case 'this_month':
                $dateFrom  = $now->copy()->startOfMonth();
                $dateTo    = $now->copy()->endOfDay();
                $chartDays = $now->day;
                break;
            case 'last_month':
                $dateFrom  = $now->copy()->subMonth()->startOfMonth();
                $dateTo    = $now->copy()->subMonth()->endOfMonth();
                $chartDays = $now->copy()->subMonth()->daysInMonth;
                break;
            default: // '7'
                $dateFrom  = $now->copy()->subDays(6)->startOfDay();
                $dateTo    = $now->copy()->endOfDay();
                $chartDays = 7;
        }

        $month = $now->month;
        $year  = $now->year;

        // Chỉ tính doanh thu từ đơn hàng đã giao thành công trong khoảng period
        $revenueThisMonth = Order::where('status', 'delivered')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->sum('total_amount');

        // Doanh thu kỳ trước (same duration before dateFrom)
        $duration         = $dateFrom->diffInDays($dateTo) + 1;
        $prevDateFrom     = $dateFrom->copy()->subDays($duration);
        $prevDateTo       = $dateFrom->copy()->subDay();
        $revenueLastMonth = Order::where('status', 'delivered')
            ->whereBetween('created_at', [$prevDateFrom, $prevDateTo])
            ->sum('total_amount');

        $revenueGrowth = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : 0;

        // ── Đơn hàng ───────────────────────────────────────────────────────────
        $orderStats = Order::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $totalOrders = Order::count();

        // ── Người dùng ─────────────────────────────────────────────────────────
        $totalUsers = User::where('role', 'user')->count();

        $newUsersThisMonth = User::where('role', 'user')
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->count();

        // ── Sản phẩm ───────────────────────────────────────────────────────────
        $totalProducts = Product::count();
        $activeProducts = Product::where('status', true)->count();

        // Top 5 sản phẩm bán chạy (lọc cả soft-deleted records)
        $topProducts = DB::table('order_items')
            ->join('product_variants', 'order_items.product_variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
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

        // Doanh thu theo ngày trong khoảng period
        $last7Days = collect(range($chartDays - 1, 0))->map(function ($daysAgo) use ($dateFrom, $chartDays) {
            $date    = $dateFrom->copy()->addDays($chartDays - 1 - $daysAgo);
            $revenue = Order::where('status', 'delivered')
                ->whereDate('created_at', $date->toDateString())
                ->sum('total_amount');
            return [
                'date'    => $date->format('d/m'),
                'revenue' => (float) $revenue,
            ];
        });

        // Đơn hàng theo ngày trong khoảng period
        $last7DaysOrders = collect(range($chartDays - 1, 0))->map(function ($daysAgo) use ($dateFrom, $chartDays) {
            $date  = $dateFrom->copy()->addDays($chartDays - 1 - $daysAgo);
            $count = Order::whereDate('created_at', $date->toDateString())->count();
            return [
                'date'   => $date->format('d/m'),
                'orders' => $count,
            ];
        });

        return response()->json([
            'revenue' => [
                'this_month'  => (float) $revenueThisMonth,
                'last_month'  => (float) $revenueLastMonth,
                'growth'      => $revenueGrowth,
            ],
            'orders' => [
                'total'     => $totalOrders,
                'by_status' => $orderStats,
            ],
            'users' => [
                'total'          => $totalUsers,
                'new_this_month' => $newUsersThisMonth,
            ],
            'products' => [
                'total'  => $totalProducts,
                'active' => $activeProducts,
            ],
            'top_products'      => $topProducts,
            'revenue_chart'     => $last7Days,
            'orders_chart'      => $last7DaysOrders,
        ]);
    }
}
