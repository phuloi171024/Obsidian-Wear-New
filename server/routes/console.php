<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Services\OrderService;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('orders:expire-vnpay {--limit=100}', function () {
    $count = app(OrderService::class)->expirePendingVnpayOrders(
        max(1, (int) $this->option('limit'))
    );

    $this->info("Đã hết hạn {$count} đơn VNPay.");
})->purpose('Hủy đơn VNPay quá hạn và hoàn kho/voucher');

Schedule::command('orders:expire-vnpay --limit=200')
    ->everyMinute()
    ->withoutOverlapping();

Schedule::command('sanctum:prune-expired --hours=24')
    ->daily()
    ->withoutOverlapping();
