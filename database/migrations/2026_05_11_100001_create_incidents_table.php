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
        if (Schema::hasTable('incidents')) {
            return;
        }

        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reported_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('teaching_offer_id')->nullable()->constrained('teaching_offers')->nullOnDelete();
            $table->foreignId('application_id')->nullable()->constrained('teaching_offer_applications')->nullOnDelete();
            $table->string('type');
            $table->string('status')->default('open');
            $table->string('priority')->default('normal');
            $table->string('subject');
            $table->text('description');
            $table->text('admin_notes')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
