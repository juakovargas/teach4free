<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('teacher_reviews')) {
            return;
        }

        Schema::create('teacher_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('class_session_id')->constrained('class_sessions')->cascadeOnDelete();
            $table->foreignId('teaching_offer_id')->nullable()->constrained('teaching_offers')->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->string('title', 160)->nullable();
            $table->text('comment')->nullable();
            $table->text('teacher_response')->nullable();
            $table->timestamp('teacher_responded_at')->nullable();
            $table->string('status', 32)->default('published');
            $table->timestamp('hidden_at')->nullable();
            $table->foreignId('hidden_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('hidden_reason')->nullable();
            $table->unsignedInteger('reported_count')->default(0);
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->unique(['student_user_id', 'class_session_id']);
            $table->index(['teacher_user_id', 'status']);
            $table->index(['rating', 'status']);
            $table->index('teaching_offer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_reviews');
    }
};
