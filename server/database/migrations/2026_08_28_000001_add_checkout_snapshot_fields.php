<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->string('province_code', 20)->nullable()->after('phone');
            $table->string('ward_code', 20)->nullable()->after('district');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal', 15, 2)->default(0)->after('note');
            $table->string('shipping_method', 20)->default('economy')->after('subtotal');
            $table->decimal('shipping_fee', 15, 2)->default(0)->after('shipping_method');
            $table->decimal('discount_amount', 15, 2)->default(0)->after('shipping_fee');
            $table->decimal('shipping_discount', 15, 2)->default(0)->after('discount_amount');
            $table->string('shipping_receiver_name')->nullable();
            $table->string('shipping_phone', 30)->nullable();
            $table->string('shipping_address_type', 50)->nullable();
            $table->string('shipping_province_code', 20)->nullable();
            $table->string('shipping_province', 100)->nullable();
            $table->string('shipping_district', 100)->nullable();
            $table->string('shipping_ward_code', 20)->nullable();
            $table->string('shipping_ward', 100)->nullable();
            $table->string('shipping_street')->nullable();
        });

        DB::table('orders')->update(['subtotal' => DB::raw('total_amount')]);

        DB::statement(<<<'SQL'
            UPDATE orders o
            LEFT JOIN addresses a ON a.id = o.address_id
            SET o.shipping_receiver_name = a.receiver_name,
                o.shipping_phone = a.phone,
                o.shipping_address_type = a.type,
                o.shipping_province_code = a.province_code,
                o.shipping_province = a.province,
                o.shipping_district = a.district,
                o.shipping_ward_code = a.ward_code,
                o.shipping_ward = a.ward,
                o.shipping_street = a.street
            WHERE o.address_id IS NOT NULL
        SQL);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'subtotal', 'shipping_method', 'shipping_fee',
                'discount_amount', 'shipping_discount',
                'shipping_receiver_name', 'shipping_phone',
                'shipping_address_type', 'shipping_province_code',
                'shipping_province', 'shipping_district',
                'shipping_ward_code', 'shipping_ward', 'shipping_street',
            ]);
        });

        Schema::table('addresses', function (Blueprint $table) {
            $table->dropColumn(['province_code', 'ward_code']);
        });
    }
};
