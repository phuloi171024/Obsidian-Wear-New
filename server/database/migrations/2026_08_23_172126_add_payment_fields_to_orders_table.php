<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bổ sung thông tin thanh toán cho đơn hàng.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method', 20)
                ->default('cod')
                ->after('status');

            $table->string('payment_status', 20)
                ->default('unpaid')
                ->after('payment_method');

            $table->string('vnpay_txn_ref', 100)
                ->nullable()
                ->unique()
                ->after('payment_status');

            $table->string('vnpay_transaction_no', 100)
                ->nullable()
                ->index()
                ->after('vnpay_txn_ref');

            $table->string('vnpay_response_code', 10)
                ->nullable()
                ->after('vnpay_transaction_no');

            $table->timestamp('paid_at')
                ->nullable()
                ->after('vnpay_response_code');
        });
    }

    /**
     * Hoàn tác các cột vừa thêm.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(
                'orders_vnpay_txn_ref_unique'
            );

            $table->dropIndex(
                'orders_vnpay_transaction_no_index'
            );

            $table->dropColumn([
                'payment_method',
                'payment_status',
                'vnpay_txn_ref',
                'vnpay_transaction_no',
                'vnpay_response_code',
                'paid_at',
            ]);
        });
    }
};