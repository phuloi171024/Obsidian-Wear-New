<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Cập nhật enum "status" trong bảng orders.
 * Thêm: return_requested, returned
 * Luồng mới: ... delivered → return_requested → returned | delivered(từ chối)
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE `orders`
            MODIFY COLUMN `status`
            ENUM('pending','processing','shipped','delivered','cancelled','return_requested','returned')
            NOT NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE `orders`
            MODIFY COLUMN `status`
            ENUM('pending','processing','shipped','delivered','cancelled')
            NOT NULL DEFAULT 'pending'
        ");
    }
};
