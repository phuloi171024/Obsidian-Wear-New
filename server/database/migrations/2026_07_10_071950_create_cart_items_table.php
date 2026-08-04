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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();

            // Khóa ngoại trỏ tới tài khoản mua hàng
            $table->foreignId('user_id')
                  ->constrained('users', 'id', 'fk_cart_items_user_id')
                  ->onDelete('cascade');

            // Khóa ngoại trỏ tới đúng biến thể (size/màu) của sản phẩm
            $table->foreignId('product_variant_id')
                  ->constrained('product_variants', 'id', 'fk_cart_items_variant_id')
                  ->onDelete('cascade');

            // Số lượng sản phẩm
            $table->integer('quantity')->default(1);

            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
