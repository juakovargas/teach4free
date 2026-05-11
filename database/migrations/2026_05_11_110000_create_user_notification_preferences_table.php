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
        if (Schema::hasTable('user_notification_preferences')) {
            return;
        }

        Schema::create('user_notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('email_session_scheduled_enabled')->default(true);
            $table->boolean('email_session_cancelled_enabled')->default(true);
            $table->boolean('email_session_completed_enabled')->default(true);
            $table->boolean('email_session_reminder_24h_enabled')->default(true);
            $table->boolean('email_session_reminder_1h_enabled')->default(true);
            $table->boolean('email_application_received_enabled')->default(true);
            $table->boolean('email_application_accepted_enabled')->default(true);
            $table->boolean('email_application_rejected_enabled')->default(true);
            $table->boolean('email_application_cancelled_enabled')->default(true);
            $table->boolean('email_waiting_list_enabled')->default(true);
            $table->boolean('email_platform_updates_enabled')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_notification_preferences');
    }
};
