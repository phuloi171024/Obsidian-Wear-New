<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('sale_price', 15, 2)->nullable()->after('price');
            $table->string('deal_label')->nullable()->after('sale_price');
            $table->timestamp('sale_starts_at')->nullable()->after('deal_label');
            $table->timestamp('sale_ends_at')->nullable()->after('sale_starts_at');
            $table->boolean('is_featured')->default(false)->index()->after('status');
            $table->string('sport_type')->nullable()->index()->after('is_featured');
        });

        Schema::table('brands', function (Blueprint $table) {
            $table->string('logo_url')->nullable()->after('slug');
            $table->boolean('is_featured')->default(false)->index()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['sport_type']);
            $table->dropColumn([
                'sale_price',
                'deal_label',
                'sale_starts_at',
                'sale_ends_at',
                'is_featured',
                'sport_type',
            ]);
        });

        Schema::table('brands', function (Blueprint $table) {
            $table->dropIndex(['is_featured']);
            $table->dropColumn(['logo_url', 'is_featured']);
        });
    }
};
