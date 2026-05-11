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
        if (Schema::hasTable('class_sessions')) {
            return;
        }

        Schema::create('class_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teaching_offer_id')->constrained('teaching_offers')->cascadeOnDelete();
            $table->foreignId('teacher_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('application_id')->nullable()->constrained('teaching_offer_applications')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('timezone')->default('Europe/Madrid');
            $table->unsignedSmallInteger('capacity')->default(1);
            $table->string('meeting_tool');
            $table->string('meeting_url')->nullable();
            $table->string('status')->default('scheduled');
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('no_show_marked_at')->nullable();
            $table->timestamps();

            $table->index(['teacher_user_id', 'starts_at', 'status']);
            $table->index(['teaching_offer_id', 'starts_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_sessions');
    }
};
