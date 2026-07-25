<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Thêm cột status vào bảng reviews để admin có thể ẩn/hiện đánh giá.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // 'pending' = chờ duyệt, 'approved' = đã duyệt, 'hidden' = đã ẩn
            $table->enum('status', ['pending', 'approved', 'hidden'])
                  ->default('approved')
                  ->after('comment');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
