<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('incidents') && ! Schema::hasColumn('incidents', 'public_response')) {
            Schema::table('incidents', function (Blueprint $table) {
                $table->text('public_response')->nullable()->after('admin_notes');
                $table->timestamp('public_response_sent_at')->nullable()->after('public_response');
                $table->foreignId('public_response_by')->nullable()->after('public_response_sent_at')->constrained('users')->nullOnDelete();
            });
        }

        if (Schema::hasTable('conversation_reports') && ! Schema::hasColumn('conversation_reports', 'public_response')) {
            Schema::table('conversation_reports', function (Blueprint $table) {
                $table->text('public_response')->nullable()->after('admin_notes');
                $table->timestamp('public_response_sent_at')->nullable()->after('public_response');
                $table->foreignId('public_response_by')->nullable()->after('public_response_sent_at')->constrained('users')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('conversation_reports') && Schema::hasColumn('conversation_reports', 'public_response')) {
            Schema::table('conversation_reports', function (Blueprint $table) {
                $table->dropConstrainedForeignId('public_response_by');
                $table->dropColumn(['public_response', 'public_response_sent_at']);
            });
        }

        if (Schema::hasTable('incidents') && Schema::hasColumn('incidents', 'public_response')) {
            Schema::table('incidents', function (Blueprint $table) {
                $table->dropConstrainedForeignId('public_response_by');
                $table->dropColumn(['public_response', 'public_response_sent_at']);
            });
        }
    }
};
