<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teacher_profiles', function (Blueprint $table): void {
            if (! Schema::hasColumn('teacher_profiles', 'banner_path')) {
                $table->string('banner_path')->nullable()->after('meeting_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('teacher_profiles', function (Blueprint $table): void {
            if (Schema::hasColumn('teacher_profiles', 'banner_path')) {
                $table->dropColumn('banner_path');
            }
        });
    }
};
