<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bảng flash_sales: Chương trình giảm giá theo khung giờ
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flash_sales', function (Blueprint $table) {
            $table->id();
            $table->string('name');                          // Tên chương trình
            $table->decimal('discount_percent', 5, 2);      // % giảm (0-100)
            $table->datetime('start_time');                  // Bắt đầu
            $table->datetime('end_time');                    // Kết thúc
            $table->boolean('status')->default(true);        // Bật/Tắt
            $table->timestamps();
        });

        // Bảng trung gian: flash_sale_products (1 flash sale có nhiều sản phẩm)
        Schema::create('flash_sale_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flash_sale_id')->constrained('flash_sales')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->decimal('discount_percent', 5, 2)->nullable(); // Override % riêng cho sản phẩm (nếu null = dùng flash sale %)
            $table->timestamps();

            $table->unique(['flash_sale_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flash_sale_products');
        Schema::dropIfExists('flash_sales');
    }
};
