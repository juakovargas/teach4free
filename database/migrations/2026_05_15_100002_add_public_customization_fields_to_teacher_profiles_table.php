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
        Schema::table('teacher_profiles', function (Blueprint $table): void {
            $table->text('public_intro')->nullable()->after('experience_summary');
            $table->string('profile_accent_color', 20)->nullable()->after('banner_path');
            $table->boolean('show_badges')->default(true)->after('profile_accent_color');
            $table->boolean('show_reviews')->default(true)->after('show_badges');
            $table->boolean('show_reputation_summary')->default(true)->after('show_reviews');
            $table->boolean('show_completed_sessions_count')->default(true)->after('show_reputation_summary');
            $table->boolean('show_students_helped_count')->default(true)->after('show_completed_sessions_count');
            $table->boolean('show_teaching_hours')->default(true)->after('show_students_helped_count');
            $table->boolean('show_location')->default(true)->after('show_teaching_hours');
            $table->boolean('show_availability_summary')->default(true)->after('show_location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_profiles', function (Blueprint $table): void {
            $table->dropColumn([
                'public_intro',
                'profile_accent_color',
                'show_badges',
                'show_reviews',
                'show_reputation_summary',
                'show_completed_sessions_count',
                'show_students_helped_count',
                'show_teaching_hours',
                'show_location',
                'show_availability_summary',
            ]);
        });
    }
};
