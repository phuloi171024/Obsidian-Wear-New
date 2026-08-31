<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_coupons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coupon_id')->constrained()->restrictOnDelete();
            $table->enum('coupon_kind', ['product', 'shipping']);
            $table->string('code_snapshot');
            $table->string('discount_type_snapshot', 20);
            $table->decimal('discount_value_snapshot', 15, 2);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->enum('status', ['reserved', 'used', 'released'])->default('reserved');
            $table->timestamp('reserved_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->timestamps();
            $table->unique(['order_id', 'coupon_kind']);
            $table->unique(['order_id', 'coupon_id']);
        });

        Schema::create('coupon_user_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coupon_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['reserved', 'used'])->default('reserved');
            $table->timestamp('reserved_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'coupon_id']);
            $table->index(['order_id', 'status']);
        });

        // Giữ lịch sử voucher của các đơn đã tồn tại trước migration này.
        DB::statement(<<<'SQL'
            INSERT INTO order_coupons
                (order_id, coupon_id, coupon_kind, code_snapshot,
                 discount_type_snapshot, discount_value_snapshot,
                 discount_amount, status, reserved_at, used_at, created_at, updated_at)
            SELECT o.id, c.id,
                   IF(c.discount_type = 'shipping', 'shipping', 'product'),
                   c.code, c.discount_type, c.discount_value,
                   IF(c.discount_type = 'shipping', 0, COALESCE(o.discount_amount, 0)),
                   IF(o.status = 'completed' OR o.payment_status = 'paid', 'used', 'reserved'),
                   o.created_at,
                   IF(o.status = 'completed' OR o.payment_status = 'paid', COALESCE(o.paid_at, o.updated_at), NULL),
                   NOW(), NOW()
            FROM orders o
            JOIN coupons c ON c.id = o.coupon_id
            WHERE o.coupon_id IS NOT NULL AND o.status <> 'cancelled'
        SQL);

        DB::statement(<<<'SQL'
            INSERT INTO coupon_user_usages
                (user_id, coupon_id, order_id, status, reserved_at, used_at, created_at, updated_at)
            SELECT o.user_id, o.coupon_id, MIN(o.id),
                   IF(MAX(o.status = 'completed' OR o.payment_status = 'paid') = 1, 'used', 'reserved'),
                   MIN(o.created_at),
                   IF(MAX(o.status = 'completed' OR o.payment_status = 'paid') = 1, MAX(COALESCE(o.paid_at, o.updated_at)), NULL),
                   NOW(), NOW()
            FROM orders o
            WHERE o.coupon_id IS NOT NULL AND o.status <> 'cancelled'
            GROUP BY o.user_id, o.coupon_id
        SQL);

        DB::statement(<<<'SQL'
            UPDATE coupons c
            SET c.used_count = (
                SELECT COUNT(*) FROM coupon_user_usages u
                WHERE u.coupon_id = c.id AND u.status = 'used'
            )
        SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_user_usages');
        Schema::dropIfExists('order_coupons');
    }
};
