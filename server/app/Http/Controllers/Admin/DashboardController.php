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
            ['week', 'month', 'year'],
            true
        ) ? $request->input('filter') : 'month';

        [$startDate, $endDate, $lastStartDate, $lastEndDate] =
            $this->resolvePeriod($filter);

        $revenueThisPeriod = $this->paidOrders()
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->sum('total_amount');
        $revenueLastPeriod = $this->paidOrders()
            ->whereBetween('paid_at', [$lastStartDate, $lastEndDate])
            ->sum('total_amount');
        $revenueGrowth = $revenueLastPeriod > 0
            ? round((($revenueThisPeriod - $revenueLastPeriod) / $revenueLastPeriod) * 100, 1)
            : 0;

        $orderStats = Order::whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');
        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
        $totalOrdersLastPeriod = Order::whereBetween(
            'created_at',
            [$lastStartDate, $lastEndDate]
        )->count();
        $orderGrowth = $totalOrdersLastPeriod > 0
            ? round((($totalOrders - $totalOrdersLastPeriod) / $totalOrdersLastPeriod) * 100, 1)
            : 0;

        $totalUsers = User::where('role', 'user')->count();
        $newUsersThisPeriod = User::where('role', 'user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.product_variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->whereBetween('orders.paid_at', [$startDate, $endDate])
            ->where('orders.payment_status', 'paid')
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

        $categoryStats = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.product_variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereBetween('orders.paid_at', [$startDate, $endDate])
            ->where('orders.payment_status', 'paid')
            ->whereNull('order_items.deleted_at')
            ->whereNull('product_variants.deleted_at')
            ->whereNull('products.deleted_at')
            ->select(
                'categories.id',
                'categories.name',
                DB::raw('SUM(order_items.quantity) as value')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('value')
            ->get();

        return response()->json([
            'revenue' => [
                'current' => (float) $revenueThisPeriod,
                'growth' => $revenueGrowth,
            ],
            'orders' => [
                'total' => $totalOrders,
                'growth' => $orderGrowth,
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
        return Order::query()->where('payment_status', 'paid');
    }

    private function resolvePeriod(string $filter): array
    {
        $now = Carbon::now();

        if ($filter === 'week') {
            return [
                $now->copy()->startOfWeek()->startOfDay(),
                $now->copy()->endOfWeek()->endOfDay(),
                $now->copy()->subWeek()->startOfWeek()->startOfDay(),
                $now->copy()->subWeek()->endOfWeek()->endOfDay(),
            ];
        }

        if ($filter === 'year') {
            return [
                $now->copy()->startOfYear(),
                $now->copy()->endOfYear(),
                $now->copy()->subYear()->startOfYear(),
                $now->copy()->subYear()->endOfYear(),
            ];
        }

        return [
            $now->copy()->startOfMonth(),
            $now->copy()->endOfMonth(),
            $now->copy()->subMonth()->startOfMonth(),
            $now->copy()->subMonth()->endOfMonth(),
        ];
    }

    private function buildRevenueChart(
        string $filter,
        Carbon $startDate,
        Carbon $endDate
    ) {
        if ($filter === 'year') {
            return collect(range(1, 12))->map(function (int $month) use ($startDate) {
                $from = $startDate->copy()->month($month)->startOfMonth();
                $to = $from->copy()->endOfMonth();

                return [
                    'day' => 'T' . $month,
                    'revenue' => (float) $this->paidOrders()
                        ->whereBetween('paid_at', [$from, $to])
                        ->sum('total_amount'),
                    'orders' => Order::whereBetween('created_at', [$from, $to])->count(),
                ];
            });
        }

        $days = [];
        $cursor = $startDate->copy()->startOfDay();

        while ($cursor->lte($endDate)) {
            $date = $cursor->copy();
            $days[] = [
                'day' => $date->format('d/m'),
                'revenue' => (float) $this->paidOrders()
                    ->whereDate('paid_at', $date->toDateString())
                    ->sum('total_amount'),
                'orders' => Order::whereDate(
                    'created_at',
                    $date->toDateString()
                )->count(),
            ];
            $cursor->addDay();
        }

        return collect($days);
    }
}
