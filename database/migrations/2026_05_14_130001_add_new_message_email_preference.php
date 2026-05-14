<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_notification_preferences') && ! Schema::hasColumn('user_notification_preferences', 'email_new_message_enabled')) {
            Schema::table('user_notification_preferences', function (Blueprint $table) {
                $table->boolean('email_new_message_enabled')->default(true)->after('email_waiting_list_enabled');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('user_notification_preferences') && Schema::hasColumn('user_notification_preferences', 'email_new_message_enabled')) {
            Schema::table('user_notification_preferences', function (Blueprint $table) {
                $table->dropColumn('email_new_message_enabled');
            });
        }
    }
};
