<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Kiểm tra từng cột để migration có thể chạy lại an toàn nếu lần trước
        // bị dừng giữa chừng.
        if (!Schema::hasColumn('order_items', 'product_name_snapshot')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->string('product_name_snapshot')->nullable()->after('price');
            });
        }

        if (!Schema::hasColumn('order_items', 'product_sku_snapshot')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->string('product_sku_snapshot')->nullable()->after('product_name_snapshot');
            });
        }

        if (!Schema::hasColumn('order_items', 'variant_color_snapshot')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->string('variant_color_snapshot')->nullable()->after('product_sku_snapshot');
            });
        }

        if (!Schema::hasColumn('order_items', 'variant_size_snapshot')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->string('variant_size_snapshot')->nullable()->after('variant_color_snapshot');
            });
        }

        if (!Schema::hasColumn('order_items', 'variant_image_snapshot')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->text('variant_image_snapshot')->nullable()->after('variant_size_snapshot');
            });
        }

        // Backfill đơn cũ. LEFT JOIN vẫn đọc được sản phẩm/biến thể đã soft-delete.
        // Dữ liệu snapshot đã có sẽ không bị ghi đè khi chạy lại.
        DB::statement(<<<'SQL'
            UPDATE order_items oi
            LEFT JOIN product_variants pv ON pv.id = oi.product_variant_id
            LEFT JOIN products p ON p.id = pv.product_id
            SET
                oi.product_name_snapshot = COALESCE(
                    NULLIF(oi.product_name_snapshot, ''),
                    p.name
                ),
                oi.product_sku_snapshot = COALESCE(
                    NULLIF(oi.product_sku_snapshot, ''),
                    p.sku
                ),
                oi.variant_color_snapshot = COALESCE(
                    NULLIF(oi.variant_color_snapshot, ''),
                    pv.color
                ),
                oi.variant_size_snapshot = COALESCE(
                    NULLIF(oi.variant_size_snapshot, ''),
                    pv.size
                ),
                oi.variant_image_snapshot = COALESCE(
                    NULLIF(oi.variant_image_snapshot, ''),
                    NULLIF(pv.image, ''),
                    NULLIF(p.thumbnail, '')
                )
            WHERE
                oi.product_name_snapshot IS NULL
                OR oi.product_name_snapshot = ''
                OR oi.product_sku_snapshot IS NULL
                OR oi.product_sku_snapshot = ''
                OR oi.variant_color_snapshot IS NULL
                OR oi.variant_color_snapshot = ''
                OR oi.variant_size_snapshot IS NULL
                OR oi.variant_size_snapshot = ''
                OR oi.variant_image_snapshot IS NULL
                OR oi.variant_image_snapshot = ''
        SQL);
    }

    public function down(): void
    {
        $columns = array_values(array_filter([
            Schema::hasColumn('order_items', 'product_name_snapshot')
                ? 'product_name_snapshot' : null,
            Schema::hasColumn('order_items', 'product_sku_snapshot')
                ? 'product_sku_snapshot' : null,
            Schema::hasColumn('order_items', 'variant_color_snapshot')
                ? 'variant_color_snapshot' : null,
            Schema::hasColumn('order_items', 'variant_size_snapshot')
                ? 'variant_size_snapshot' : null,
            Schema::hasColumn('order_items', 'variant_image_snapshot')
                ? 'variant_image_snapshot' : null,
        ]));

        if ($columns !== []) {
            Schema::table('order_items', function (Blueprint $table) use ($columns) {
                $table->dropColumn($columns);
            });
        }
    }
};
