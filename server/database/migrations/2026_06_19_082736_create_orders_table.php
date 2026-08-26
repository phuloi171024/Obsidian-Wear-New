<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('coupon_id')
                ->nullable()
                ->constrained('coupons')
                ->nullOnDelete();

            $table->foreignId('address_id')
                ->nullable()
                ->constrained('addresses')
                ->nullOnDelete();

            $table->text('note')->nullable();

            $table->decimal('total_amount', 15, 2);

            $table->enum('status', [
                'pending',
                'shipped',
                'completed',
                'cancelled',
            ])->default('pending');

            /*
             * Các cột thanh toán sẽ được bổ sung bởi migration:
             * 2026_08_23_172126_add_payment_fields_to_orders_table
             */
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};