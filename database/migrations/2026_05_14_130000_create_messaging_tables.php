<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('conversations')) {
            Schema::create('conversations', function (Blueprint $table) {
                $table->id();
                $table->string('type', 32)->default('direct');
                $table->foreignId('teaching_offer_id')->nullable()->constrained('teaching_offers')->nullOnDelete();
                $table->foreignId('teaching_offer_application_id')->nullable()->constrained('teaching_offer_applications')->nullOnDelete();
                $table->foreignId('class_session_id')->nullable()->constrained('class_sessions')->nullOnDelete();
                $table->string('subject')->nullable();
                $table->string('status', 32)->default('open');
                $table->timestamp('last_message_at')->nullable();
                $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('closed_at')->nullable();
                $table->foreignId('closed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('close_reason')->nullable();
                $table->timestamps();

                $table->index(['type', 'status']);
                $table->index('last_message_at');
                $table->index('teaching_offer_application_id');
                $table->unique('class_session_id');
            });
        }

        if (! Schema::hasTable('conversation_participants')) {
            Schema::create('conversation_participants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('role', 32)->default('participant');
                $table->timestamp('last_read_at')->nullable();
                $table->timestamp('archived_at')->nullable();
                $table->timestamp('muted_at')->nullable();
                $table->timestamps();

                $table->unique(['conversation_id', 'user_id']);
                $table->index(['user_id', 'archived_at']);
            });
        }

        if (! Schema::hasTable('conversation_messages')) {
            Schema::create('conversation_messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
                $table->foreignId('sender_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->text('body');
                $table->boolean('system_message')->default(false);
                $table->timestamp('read_at')->nullable();
                $table->timestamp('edited_at')->nullable();
                $table->timestamp('deleted_at')->nullable();
                $table->timestamps();

                $table->index(['conversation_id', 'created_at']);
                $table->index('sender_user_id');
            });
        }

        if (! Schema::hasTable('conversation_reports')) {
            Schema::create('conversation_reports', function (Blueprint $table) {
                $table->id();
                $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
                $table->foreignId('message_id')->nullable()->constrained('conversation_messages')->nullOnDelete();
                $table->foreignId('reporter_user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('reported_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('type', 32);
                $table->string('status', 32)->default('open');
                $table->string('priority', 32)->default('normal');
                $table->text('description')->nullable();
                $table->text('admin_notes')->nullable();
                $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('resolved_at')->nullable();
                $table->timestamps();

                $table->index(['status', 'priority']);
                $table->index(['conversation_id', 'status']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('conversation_reports');
        Schema::dropIfExists('conversation_messages');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('conversations');
    }
};
