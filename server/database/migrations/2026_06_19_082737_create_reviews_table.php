<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();

            $table->integer('rating');
            $table->text('comment')->nullable();

            $table->string('status', 50)
                ->default('pending');

            $table->unsignedInteger('report_count')
                ->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index([
                'product_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};