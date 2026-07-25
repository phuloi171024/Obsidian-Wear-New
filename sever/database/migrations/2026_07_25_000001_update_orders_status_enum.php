<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Cập nhật enum "status" trong bảng orders.
 * Thêm: processing, delivered
 * Bỏ: completed
 * Luồng mới: pending -> processing -> shipped -> delivered | cancelled
 */
return new class extends Migration
{
    public function up(): void
    {
        // MySQL yêu cầu MODIFY toàn bộ cột khi đổi enum
        DB::statement("
            ALTER TABLE `orders`
            MODIFY COLUMN `status`
            ENUM('pending','processing','shipped','delivered','cancelled')
            NOT NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE `orders`
            MODIFY COLUMN `status`
            ENUM('pending','shipped','completed','cancelled')
            NOT NULL DEFAULT 'pending'
        ");
    }
};
