<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vnpay_payment_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();
            $table->string('txn_ref', 100)->unique();
            $table->decimal('amount', 15, 2);
            $table->string('status', 20)->default('pending')->index();
            $table->string('transaction_no', 100)->nullable()->index();
            $table->string('response_code', 10)->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('payment_expires_at')
                ->nullable()
                ->index()
                ->after('paid_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_payment_expires_at_index');
            $table->dropColumn('payment_expires_at');
        });

        Schema::dropIfExists('vnpay_payment_attempts');
    }
};
