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
        $accentAfter = Schema::hasColumn('teacher_profiles', 'banner_path') ? 'banner_path' : 'meeting_url';

        Schema::table('teacher_profiles', function (Blueprint $table): void {
            if (! Schema::hasColumn('teacher_profiles', 'public_intro')) {
                $table->text('public_intro')->nullable()->after('experience_summary');
            }
        });

        Schema::table('teacher_profiles', function (Blueprint $table) use ($accentAfter): void {
            if (! Schema::hasColumn('teacher_profiles', 'profile_accent_color')) {
                $table->string('profile_accent_color', 7)->nullable()->after($accentAfter);
            }
        });

        Schema::table('teacher_profiles', function (Blueprint $table): void {
            if (! Schema::hasColumn('teacher_profiles', 'show_badges')) {
                $table->boolean('show_badges')->default(true)->after('profile_accent_color');
            }

            if (! Schema::hasColumn('teacher_profiles', 'show_reviews')) {
                $table->boolean('show_reviews')->default(true)->after('show_badges');
            }

            if (! Schema::hasColumn('teacher_profiles', 'show_reputation_summary')) {
                $table->boolean('show_reputation_summary')->default(true)->after('show_reviews');
            }

            if (! Schema::hasColumn('teacher_profiles', 'show_completed_sessions_count')) {
                $table->boolean('show_completed_sessions_count')->default(true)->after('show_reputation_summary');
            }

            if (! Schema::hasColumn('teacher_profiles', 'show_students_helped_count')) {
                $table->boolean('show_students_helped_count')->default(true)->after('show_completed_sessions_count');
            }

            if (! Schema::hasColumn('teacher_profiles', 'show_teaching_hours')) {
                $table->boolean('show_teaching_hours')->default(true)->after('show_students_helped_count');
            }

            if (! Schema::hasColumn('teacher_profiles', 'show_location')) {
                $table->boolean('show_location')->default(true)->after('show_teaching_hours');
            }

            if (! Schema::hasColumn('teacher_profiles', 'show_availability_summary')) {
                $table->boolean('show_availability_summary')->default(true)->after('show_location');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ([
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
        ] as $column) {
            if (! Schema::hasColumn('teacher_profiles', $column)) {
                continue;
            }

            Schema::table('teacher_profiles', function (Blueprint $table) use ($column): void {
                $table->dropColumn($column);
            });
        }
    }
};
