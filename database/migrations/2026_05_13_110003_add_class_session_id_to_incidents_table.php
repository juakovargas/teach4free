<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('incidents') || Schema::hasColumn('incidents', 'class_session_id')) {
            return;
        }

        Schema::table('incidents', function (Blueprint $table) {
            $table->foreignId('class_session_id')
                ->nullable()
                ->after('application_id')
                ->constrained('class_sessions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('incidents') || ! Schema::hasColumn('incidents', 'class_session_id')) {
            return;
        }

        Schema::table('incidents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('class_session_id');
        });
    }
};
