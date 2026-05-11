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
        Schema::create('teaching_offer_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teaching_offer_id')->constrained('teaching_offers')->cascadeOnDelete();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('teacher_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('preferred_language_id')->nullable()->constrained('languages')->nullOnDelete();
            $table->string('status')->index();
            $table->text('message')->nullable();
            $table->text('availability_note')->nullable();
            $table->text('teacher_response')->nullable();
            $table->timestamp('requested_at')->nullable()->index();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['teaching_offer_id', 'status']);
            $table->index(['student_user_id', 'status']);
            $table->index(['teacher_user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teaching_offer_applications');
    }
};
