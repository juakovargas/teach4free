<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('category_proposals')) {
            Schema::create('category_proposals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('proposed_by_user_id')->constrained('users')->cascadeOnDelete();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('suggested_color', 20)->nullable();
                $table->string('suggested_icon', 80)->nullable();
                $table->string('status')->default('pending');
                $table->text('admin_notes')->nullable();
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('reviewed_at')->nullable();
                $table->foreignId('approved_category_id')->nullable()->constrained('teaching_categories')->nullOnDelete();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('subject_proposals')) {
            Schema::create('subject_proposals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('proposed_by_user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('teaching_category_id')->nullable()->constrained('teaching_categories')->nullOnDelete();
                $table->foreignId('category_proposal_id')->nullable()->constrained('category_proposals')->nullOnDelete();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('status')->default('pending');
                $table->text('admin_notes')->nullable();
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('reviewed_at')->nullable();
                $table->foreignId('approved_subject_id')->nullable()->constrained('teaching_subjects')->nullOnDelete();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('subject_proposals');
        Schema::dropIfExists('category_proposals');
    }
};
