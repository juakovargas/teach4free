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
        if (Schema::hasTable('class_session_attendees')) {
            return;
        }

        Schema::create('class_session_attendees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_session_id')->constrained('class_sessions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('application_id')->nullable()->constrained('teaching_offer_applications')->nullOnDelete();
            $table->string('status')->default('enrolled');
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('no_show_at')->nullable();
            $table->timestamps();

            $table->unique(['class_session_id', 'user_id']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_session_attendees');
    }
};
