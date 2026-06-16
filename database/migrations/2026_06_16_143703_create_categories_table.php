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
        Schema::create('categories', function (Blueprint $table) {
           $table->id();
        $table->string('name')->unique(); // Tên danh mục (không được trùng)
        $table->string('slug')->unique(); // Đường dẫn thân thiện trên web
        $table->text('description')->nullable(); // Mô tả (cho phép để trống)
        $table->boolean('status')->default(true); // Trạng thái Ẩn/Hiện
        $table->timestamps(); // Tự động tạo 2 cột created_at và updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
