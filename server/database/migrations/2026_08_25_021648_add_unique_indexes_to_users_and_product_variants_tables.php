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
        Schema::table('users', function (Blueprint $table) {
            $table->unique(
                'phone',
                'users_phone_unique'
            );

            $table->unique(
                'google_id',
                'users_google_id_unique'
            );
        });

        Schema::table(
            'product_variants',
            function (Blueprint $table) {
                $table->unique(
                    ['product_id', 'color', 'size'],
                    'product_variants_product_color_size_unique'
                );
            }
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table(
            'product_variants',
            function (Blueprint $table) {
                $table->dropUnique(
                    'product_variants_product_color_size_unique'
                );
            }
        );

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_phone_unique');
            $table->dropUnique('users_google_id_unique');
        });
    }
};