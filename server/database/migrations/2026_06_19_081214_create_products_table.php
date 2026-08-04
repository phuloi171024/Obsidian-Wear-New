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
   Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->constrained('categories', 'id', 'fk_products_category_id')->onDelete('cascade');
    $table->foreignId('brand_id')->nullable()->constrained('brands', 'id', 'fk_products_brand_id')->onDelete('set null');
    $table->string('name')->index();
    $table->string('slug')->unique();
    $table->string('sku')->unique();
    $table->decimal('price', 15, 2);
    $table->string('thumbnail')->nullable();
    $table->longText('description')->nullable();
    $table->boolean('status')->default(true);
    $table->timestamps();
    $table->softDeletes();
});
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};