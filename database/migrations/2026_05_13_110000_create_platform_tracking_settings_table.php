<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('platform_tracking_settings')) {
            return;
        }

        Schema::create('platform_tracking_settings', function (Blueprint $table) {
            $table->id();
            $table->string('google_analytics_id')->nullable();
            $table->string('google_tag_manager_id')->nullable();
            $table->string('meta_pixel_id')->nullable();
            $table->string('tiktok_pixel_id')->nullable();
            $table->string('linkedin_partner_id')->nullable();
            $table->string('microsoft_clarity_id')->nullable();
            $table->string('plausible_domain')->nullable();
            $table->text('custom_head_script')->nullable();
            $table->text('custom_body_script')->nullable();
            $table->boolean('tracking_enabled')->default(false);
            $table->boolean('cookie_consent_required')->default(true);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_tracking_settings');
    }
};
