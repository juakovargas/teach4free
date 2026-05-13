<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('platform_settings')) {
            return;
        }

        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('platform_name')->default('Teach4Free');
            $table->string('support_email')->nullable();
            $table->string('default_locale', 8)->default('en');
            $table->boolean('allow_teacher_category_proposals')->default(true);
            $table->boolean('allow_teacher_subject_proposals')->default(true);
            $table->boolean('require_email_verification')->default(true);
            $table->boolean('allow_public_teacher_profiles')->default(true);
            $table->boolean('allow_open_public_sessions')->default(true);
            $table->text('maintenance_notice')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};
