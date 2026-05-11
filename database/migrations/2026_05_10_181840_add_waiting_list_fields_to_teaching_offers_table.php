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
        Schema::table('teaching_offers', function (Blueprint $table) {
            $table->boolean('allow_waiting_list')->default(true)->after('is_accepting_applications');
            $table->unsignedSmallInteger('waiting_list_limit')->nullable()->after('allow_waiting_list');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teaching_offers', function (Blueprint $table) {
            $table->dropColumn(['allow_waiting_list', 'waiting_list_limit']);
        });
    }
};
