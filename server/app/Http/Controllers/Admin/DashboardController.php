<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $filter = in_array(
            $request->input('filter'),
            ['week', 'month', 'year', 'all'],
            true
        ) ? $request->input('filter') : 'month';

        [$startDate, $endDate, $lastStartDate, $lastEndDate] =
            $this->resolvePeriod($filter);

        // Doanh thu và số đơn đều chỉ tính đơn đã thanh toán theo paid_at.
        $currentPaidOrders = $this->withinPeriod(
            $this->paidOrders(),
            'paid_at',
            $startDate,
            $endDate
        );

        $revenueThisPeriod = (float) (clone $currentPaidOrders)
            ->sum('total_amount');
        $totalOrders = (clone $currentPaidOrders)->count();
        $orderStats = (clone $currentPaidOrders)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $revenueLastPeriod = null;
        $totalOrdersLastPeriod = null;

        if ($lastStartDate && $lastEndDate) {
            $lastPaidOrders = $this->withinPeriod(
                $this->paidOrders(),
                'paid_at',
                $lastStartDate,
                $lastEndDate
            );

            $revenueLastPeriod = (float) (clone $lastPaidOrders)
                ->sum('total_amount');
            $totalOrdersLastPeriod = (clone $lastPaidOrders)->count();
        }

        $totalUsers = User::where('role', 'user')->count();
        $newUsersQuery = User::where('role', 'user');
        $this->withinPeriod(
            $newUsersQuery,
            'created_at',
            $startDate,
            $endDate
        );
        $newUsersThisPeriod = $newUsersQuery->count();

        $topProductsQuery = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.product_variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->where('orders.payment_status', 'paid')
            ->whereNull('orders.deleted_at')
            ->whereNull('order_items.deleted_at')
            ->whereNull('product_variants.deleted_at')
            ->whereNull('products.deleted_at');

        $this->withinPeriod(
            $topProductsQuery,
            'orders.paid_at',
            $startDate,
            $endDate
        );

        $topProducts = $topProductsQuery
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

        $categoryStatsQuery = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.product_variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.payment_status', 'paid')
            ->whereNull('orders.deleted_at')
            ->whereNull('order_items.deleted_at')
            ->whereNull('product_variants.deleted_at')
            ->whereNull('products.deleted_at')
            ->whereNull('categories.deleted_at');

        $this->withinPeriod(
            $categoryStatsQuery,
            'orders.paid_at',
            $startDate,
            $endDate
        );

        $categoryStats = $categoryStatsQuery
            ->select(
                'categories.id',
                'categories.name',
                DB::raw('SUM(order_items.quantity) as value')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('value')
            ->get();

        return response()->json([
            'filter' => $filter,
            'revenue' => [
                'current' => $revenueThisPeriod,
                'growth' => $this->calculateGrowth(
                    $revenueThisPeriod,
                    $revenueLastPeriod
                ),
            ],
            'orders' => [
                'total' => $totalOrders,
                'growth' => $this->calculateGrowth(
                    $totalOrders,
                    $totalOrdersLastPeriod
                ),
                'by_status' => $orderStats,
            ],
            'users' => [
                'total' => $totalUsers,
                'new_this_period' => $newUsersThisPeriod,
            ],
            'products' => [
                'total' => Product::count(),
                'active' => Product::where('status', true)->count(),
            ],
            'top_products' => $topProducts,
            'category_stats' => $categoryStats,
            'revenue_chart' => $this->buildRevenueChart(
                $filter,
                $startDate,
                $endDate
            ),
        ]);
    }

    private function paidOrders()
    {
        return Order::query()
            ->where('payment_status', 'paid')
            ->whereNotNull('paid_at');
    }

    private function withinPeriod(
        $query,
        string $column,
        ?Carbon $startDate,
        Carbon $endDate
    ) {
        if ($startDate) {
            return $query->whereBetween($column, [$startDate, $endDate]);
        }

        return $query->where($column, '<=', $endDate);
    }

    /**
     * Kỳ hiện tại tính đến lúc này; kỳ trước có cùng thời lượng đã trôi qua.
     */
    private function resolvePeriod(string $filter): array
    {
        $now = Carbon::now();

        if ($filter === 'all') {
            return [null, $now, null, null];
        }

        if ($filter === 'week') {
            $startDate = $now->copy()->startOfWeek()->startOfDay();
            $lastStartDate = $startDate->copy()->subWeek();
            $lastNaturalEnd = $lastStartDate->copy()->endOfWeek()->endOfDay();
        } elseif ($filter === 'year') {
            $startDate = $now->copy()->startOfYear()->startOfDay();
            $lastStartDate = $startDate->copy()->subYear();
            $lastNaturalEnd = $lastStartDate->copy()->endOfYear()->endOfDay();
        } else {
            $startDate = $now->copy()->startOfMonth()->startOfDay();
            $lastStartDate = $startDate->copy()->subMonth();
            $lastNaturalEnd = $lastStartDate->copy()->endOfMonth()->endOfDay();
        }

        $elapsedSeconds = $startDate->diffInSeconds($now);
        $lastEndDate = $lastStartDate->copy()->addSeconds($elapsedSeconds);

        if ($lastEndDate->gt($lastNaturalEnd)) {
            $lastEndDate = $lastNaturalEnd;
        }

        return [$startDate, $now, $lastStartDate, $lastEndDate];
    }

    private function calculateGrowth($current, $previous): ?float
    {
        if ($previous === null) {
            return null;
        }

        $current = (float) $current;
        $previous = (float) $previous;

        if ($previous == 0.0) {
            return $current == 0.0 ? 0.0 : null;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function buildRevenueChart(
        string $filter,
        ?Carbon $startDate,
        Carbon $endDate
    ) {
        if ($filter === 'all') {
            $firstPaidAt = $this->paidOrders()->min('paid_at');

            if (!$firstPaidAt) {
                return collect();
            }

            $startDate = Carbon::parse($firstPaidAt)->startOfMonth();
        }

        if ($filter === 'year' || $filter === 'all') {
            $months = [];
            $cursor = $startDate->copy()->startOfMonth();
            $lastMonth = $endDate->copy()->startOfMonth();

            while ($cursor->lte($lastMonth)) {
                $from = $cursor->copy()->startOfMonth();
                $to = $cursor->isSameMonth($endDate)
                    ? $endDate->copy()
                    : $cursor->copy()->endOfMonth();

                $orders = $this->withinPeriod(
                    $this->paidOrders(),
                    'paid_at',
                    $from,
                    $to
                );

                $months[] = [
                    'day' => $filter === 'all'
                        ? $cursor->format('m/Y')
                        : 'T' . $cursor->month,
                    'revenue' => (float) (clone $orders)->sum('total_amount'),
                    'orders' => (clone $orders)->count(),
                ];

                $cursor->addMonth();
            }

            return collect($months);
        }

        $days = [];
        $cursor = $startDate->copy()->startOfDay();
        $lastDay = $endDate->copy()->startOfDay();

        while ($cursor->lte($lastDay)) {
            $from = $cursor->copy()->startOfDay();
            $to = $cursor->isSameDay($endDate)
                ? $endDate->copy()
                : $cursor->copy()->endOfDay();

            $orders = $this->withinPeriod(
                $this->paidOrders(),
                'paid_at',
                $from,
                $to
            );

            $days[] = [
                'day' => $cursor->format('d/m'),
                'revenue' => (float) (clone $orders)->sum('total_amount'),
                'orders' => (clone $orders)->count(),
            ];

            $cursor->addDay();
        }

        return collect($days);
    }
}
