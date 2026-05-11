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
            $table->string('timezone')->default('Europe/Madrid')->after('preferred_locale');
            $table->text('bio')->nullable()->after('timezone');
            $table->boolean('is_public')->default(true)->after('bio');
            $table->text('learning_interests')->nullable()->after('is_public');
            $table->text('teaching_interests')->nullable()->after('learning_interests');
            $table->string('google_id')->nullable()->unique()->after('role');
            $table->string('avatar_url', 2048)->nullable()->after('google_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['google_id']);
            $table->dropColumn([
                'timezone',
                'bio',
                'is_public',
                'learning_interests',
                'teaching_interests',
                'google_id',
                'avatar_url',
            ]);
        });
    }
};
