<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL không rollback DDL khi migration lỗi giữa chừng. Các kiểm tra
        // này giúp chạy lại an toàn nếu hai cột đã được tạo ở lần chạy trước.
        if (!Schema::hasColumn('coupons', 'starts_at')) {
            Schema::table('coupons', function (Blueprint $table) {
                $table->timestamp('starts_at')->nullable()->after('used_count');
            });
        }

        if (!Schema::hasColumn('coupons', 'per_user_limit')) {
            Schema::table('coupons', function (Blueprint $table) {
                $table->unsignedInteger('per_user_limit')->nullable()->default(1)->after('usage_limit');
            });
        }

        // Tạo index thay thế trước vì MySQL đang dùng unique index cũ cho FK.
        $this->addIndexIfMissing(
            'coupon_user_usages',
            'coupon_user_usages_user_id_support_index',
            '`user_id`'
        );
        $this->addIndexIfMissing(
            'coupon_user_usages',
            'coupon_user_usages_coupon_id_support_index',
            '`coupon_id`'
        );

        if ($this->indexExists('coupon_user_usages', 'coupon_user_usages_user_id_coupon_id_unique')) {
            DB::statement(
                'ALTER TABLE `coupon_user_usages` DROP INDEX `coupon_user_usages_user_id_coupon_id_unique`'
            );
        }

        $this->addIndexIfMissing(
            'coupon_user_usages',
            'coupon_usage_user_coupon_index',
            '`user_id`, `coupon_id`'
        );
    }

    public function down(): void
    {
        if ($this->indexExists('coupon_user_usages', 'coupon_usage_user_coupon_index')) {
            DB::statement(
                'ALTER TABLE `coupon_user_usages` DROP INDEX `coupon_usage_user_coupon_index`'
            );
        }

        if (!$this->indexExists('coupon_user_usages', 'coupon_user_usages_user_id_coupon_id_unique')) {
            DB::statement(
                'ALTER TABLE `coupon_user_usages` ADD UNIQUE INDEX `coupon_user_usages_user_id_coupon_id_unique` (`user_id`, `coupon_id`)'
            );
        }

        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn(['starts_at', 'per_user_limit']);
        });
    }

    private function indexExists(string $table, string $index): bool
    {
        $result = DB::selectOne(
            'SELECT COUNT(*) AS aggregate FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?',
            [$table, $index]
        );

        return (int) ($result->aggregate ?? 0) > 0;
    }

    private function addIndexIfMissing(string $table, string $index, string $columns): void
    {
        if (!$this->indexExists($table, $index)) {
            DB::statement(
                "ALTER TABLE `{$table}` ADD INDEX `{$index}` ({$columns})"
            );
        }
    }
};
