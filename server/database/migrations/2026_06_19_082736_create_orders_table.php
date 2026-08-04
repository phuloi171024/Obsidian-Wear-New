<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users', 'id', 'fk_orders_user_id')->onDelete('cascade');
    $table->foreignId('coupon_id')->nullable()->constrained('coupons', 'id', 'fk_orders_coupon_id')->onDelete('set null');
    $table->decimal('total_amount', 15, 2);
    $table->enum('status', ['pending', 'shipped', 'completed', 'cancelled'])->default('pending');
    $table->timestamps();
    $table->softDeletes();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};