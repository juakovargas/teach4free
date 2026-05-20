<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('platform_settings')) {
            return;
        }

        Schema::table('platform_settings', function (Blueprint $table): void {
            if (! Schema::hasColumn('platform_settings', 'seo_site_name')) {
                $table->string('seo_site_name', 120)->nullable()->after('maintenance_notice');
            }

            if (! Schema::hasColumn('platform_settings', 'seo_default_meta_title')) {
                $table->string('seo_default_meta_title', 180)->nullable()->after('seo_site_name');
            }

            if (! Schema::hasColumn('platform_settings', 'seo_default_meta_description')) {
                $table->string('seo_default_meta_description', 500)->nullable()->after('seo_default_meta_title');
            }

            if (! Schema::hasColumn('platform_settings', 'seo_default_robots')) {
                $table->string('seo_default_robots', 80)->default('index,follow')->after('seo_default_meta_description');
            }

            if (! Schema::hasColumn('platform_settings', 'seo_default_og_image_path')) {
                $table->string('seo_default_og_image_path')->nullable()->after('seo_default_robots');
            }

            if (! Schema::hasColumn('platform_settings', 'seo_enable_sitemap')) {
                $table->boolean('seo_enable_sitemap')->default(true)->after('seo_default_og_image_path');
            }

            if (! Schema::hasColumn('platform_settings', 'seo_enable_structured_data')) {
                $table->boolean('seo_enable_structured_data')->default(true)->after('seo_enable_sitemap');
            }

            if (! Schema::hasColumn('platform_settings', 'seo_search_indexing_enabled')) {
                $table->boolean('seo_search_indexing_enabled')->default(true)->after('seo_enable_structured_data');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('platform_settings')) {
            return;
        }

        Schema::table('platform_settings', function (Blueprint $table): void {
            $columns = [
                'seo_site_name',
                'seo_default_meta_title',
                'seo_default_meta_description',
                'seo_default_robots',
                'seo_default_og_image_path',
                'seo_enable_sitemap',
                'seo_enable_structured_data',
                'seo_search_indexing_enabled',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('platform_settings', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
