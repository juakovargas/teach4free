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
        Schema::create('teacher_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('headline')->nullable();
            $table->text('teaching_bio')->nullable();
            $table->text('experience_summary')->nullable();
            $table->string('preferred_teaching_mode')->default('any');
            $table->unsignedSmallInteger('max_students_per_session')->default(1);
            $table->unsignedSmallInteger('default_session_duration_minutes')->default(60);
            $table->string('meeting_tool')->default('not_decided');
            $table->string('meeting_url', 2048)->nullable();
            $table->boolean('is_active')->default(false)->index();
            $table->boolean('is_accepting_requests')->default(false)->index();
            $table->boolean('is_verified')->default(false)->index();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_profiles');
    }
};
