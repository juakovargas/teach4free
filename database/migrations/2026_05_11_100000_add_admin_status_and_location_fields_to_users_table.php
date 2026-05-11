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
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'country_code')) {
                $table->string('country_code', 2)->nullable()->after('timezone');
            }

            if (! Schema::hasColumn('users', 'city')) {
                $table->string('city')->nullable()->after('country_code');
            }

            if (! Schema::hasColumn('users', 'banned_at')) {
                $table->timestamp('banned_at')->nullable()->after('avatar_path');
            }

            if (! Schema::hasColumn('users', 'banned_reason')) {
                $table->text('banned_reason')->nullable()->after('banned_at');
            }

            if (! Schema::hasColumn('users', 'blocked_at')) {
                $table->timestamp('blocked_at')->nullable()->after('banned_reason');
            }

            if (! Schema::hasColumn('users', 'blocked_reason')) {
                $table->text('blocked_reason')->nullable()->after('blocked_at');
            }

            if (! Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('blocked_reason');
            }

            if (! Schema::hasColumn('users', 'last_login_ip')) {
                $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $columns = collect([
            'country_code',
            'city',
            'banned_at',
            'banned_reason',
            'blocked_at',
            'blocked_reason',
            'last_login_at',
            'last_login_ip',
        ])->filter(fn (string $column): bool => Schema::hasColumn('users', $column))->values()->all();

        if ($columns === []) {
            return;
        }

        Schema::table('users', function (Blueprint $table) use ($columns) {
            $table->dropColumn($columns);
        });
    }
};
