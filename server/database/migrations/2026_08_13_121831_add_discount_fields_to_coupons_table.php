<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->string('discount_type')
                ->default('fixed')
                ->after('code');

            $table->decimal('min_order_value', 15, 2)
                ->default(0)
                ->after('discount_value');

            $table->unsignedInteger('usage_limit')
                ->default(100)
                ->after('min_order_value');

            $table->unsignedInteger('used_count')
                ->default(0)
                ->after('usage_limit');

            $table->timestamp('expires_at')
                ->nullable()
                ->after('used_count');
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn([
                'discount_type',
                'min_order_value',
                'usage_limit',
                'used_count',
                'expires_at',
            ]);
        });
    }
};