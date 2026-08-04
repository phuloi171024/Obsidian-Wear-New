<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bảng posts: Bài viết / Blog tư vấn
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Người viết
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');                          // Nội dung HTML
            $table->string('thumbnail')->nullable();          // Ảnh bìa
            $table->string('excerpt', 500)->nullable();       // Tóm tắt ngắn
            $table->string('category', 100)->nullable();      // Danh mục bài viết
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
