<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('cookie_settings')) {
            return;
        }

        Schema::create('cookie_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('banner_enabled')->default(true);
            $table->string('consent_required_regions', 32)->default('eu_eea_uk_ch');
            $table->text('custom_required_country_codes')->nullable();
            $table->unsignedSmallInteger('consent_duration_days')->default(180);
            $table->string('consent_version', 32)->default('1.0');
            $table->boolean('show_reject_button')->default(true);
            $table->boolean('show_configure_button')->default(true);
            $table->boolean('block_analytics_until_consent')->default(true);
            $table->boolean('block_marketing_until_consent')->default(true);
            $table->boolean('block_external_content_until_consent')->default(true);
            $table->string('banner_style', 32)->default('modal_center');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cookie_settings');
    }
};
