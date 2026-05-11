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
        Schema::create('teaching_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_profile_id')->nullable()->constrained('teacher_profiles')->nullOnDelete();
            $table->foreignId('teaching_category_id')->constrained('teaching_categories')->restrictOnDelete();
            $table->foreignId('teaching_subject_id')->nullable()->constrained('teaching_subjects')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('summary', 500);
            $table->longText('description');
            $table->string('level');
            $table->string('teaching_mode');
            $table->string('session_type');
            $table->unsignedSmallInteger('max_students')->nullable();
            $table->unsignedSmallInteger('duration_minutes');
            $table->string('meeting_tool')->default('not_decided');
            $table->string('meeting_url', 2048)->nullable();
            $table->string('timezone')->default('Europe/Madrid');
            $table->text('availability_summary')->nullable();
            $table->text('requirements')->nullable();
            $table->text('materials_summary')->nullable();
            $table->boolean('is_public')->default(false)->index();
            $table->boolean('is_active')->default(false)->index();
            $table->boolean('is_accepting_applications')->default(false)->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();

            $table->index(['is_public', 'is_active', 'published_at']);
            $table->index(['teaching_category_id', 'teaching_subject_id']);
            $table->index(['level', 'teaching_mode', 'session_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teaching_offers');
    }
};
