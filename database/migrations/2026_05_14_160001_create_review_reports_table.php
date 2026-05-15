<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('review_reports')) {
            return;
        }

        Schema::create('review_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_review_id')->constrained('teacher_reviews')->cascadeOnDelete();
            $table->foreignId('reporter_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 32);
            $table->text('description')->nullable();
            $table->string('status', 32)->default('open');
            $table->string('priority', 32)->default('normal');
            $table->text('admin_notes')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'priority']);
            $table->index(['teacher_review_id', 'status']);
            $table->index(['reporter_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_reports');
    }
};
