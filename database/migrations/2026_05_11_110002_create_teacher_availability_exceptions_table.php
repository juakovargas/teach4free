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
        if (Schema::hasTable('teacher_availability_exceptions')) {
            return;
        }

        Schema::create('teacher_availability_exceptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_profile_id')->nullable()->constrained('teacher_profiles')->nullOnDelete();
            $table->date('date');
            $table->time('starts_at')->nullable();
            $table->time('ends_at')->nullable();
            $table->string('type');
            $table->text('reason')->nullable();
            $table->boolean('is_full_day')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'date', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_availability_exceptions');
    }
};
