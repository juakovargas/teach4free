<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('conversation_messages') || Schema::hasColumn('conversation_messages', 'reply_to_message_id')) {
            return;
        }

        Schema::table('conversation_messages', function (Blueprint $table) {
            $table
                ->foreignId('reply_to_message_id')
                ->nullable()
                ->after('sender_user_id')
                ->constrained('conversation_messages')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('conversation_messages') || ! Schema::hasColumn('conversation_messages', 'reply_to_message_id')) {
            return;
        }

        Schema::table('conversation_messages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reply_to_message_id');
        });
    }
};
