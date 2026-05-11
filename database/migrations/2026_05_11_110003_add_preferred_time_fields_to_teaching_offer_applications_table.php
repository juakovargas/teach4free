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
        Schema::table('teaching_offer_applications', function (Blueprint $table) {
            if (! Schema::hasColumn('teaching_offer_applications', 'preferred_starts_at')) {
                $table->dateTime('preferred_starts_at')->nullable()->after('preferred_language_id');
            }

            if (! Schema::hasColumn('teaching_offer_applications', 'preferred_timezone')) {
                $table->string('preferred_timezone')->nullable()->after('preferred_starts_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $columns = collect([
            'preferred_starts_at',
            'preferred_timezone',
        ])->filter(fn (string $column): bool => Schema::hasColumn('teaching_offer_applications', $column))->values()->all();

        if ($columns === []) {
            return;
        }

        Schema::table('teaching_offer_applications', function (Blueprint $table) use ($columns) {
            $table->dropColumn($columns);
        });
    }
};
