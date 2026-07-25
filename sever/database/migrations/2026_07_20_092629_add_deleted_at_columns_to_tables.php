<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Thêm cột deleted_at (SoftDeletes) vào các bảng nếu chưa có.
 * Cần thiết vì các model dùng SoftDeletes nhưng bảng có thể được tạo
 * trước khi migration có softDeletes().
 */
return new class extends Migration
{
    public function up(): void
    {
        // categories
        if (Schema::hasTable('categories') && !Schema::hasColumn('categories', 'deleted_at')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // brands
        if (Schema::hasTable('brands') && !Schema::hasColumn('brands', 'deleted_at')) {
            Schema::table('brands', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // products
        if (Schema::hasTable('products') && !Schema::hasColumn('products', 'deleted_at')) {
            Schema::table('products', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // reviews
        if (Schema::hasTable('reviews') && !Schema::hasColumn('reviews', 'deleted_at')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        $tables = ['categories', 'brands', 'products', 'reviews'];
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropSoftDeletes();
                });
            }
        }
    }
};
