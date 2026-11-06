<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('home_stay_items', function (Blueprint $table) {
            $table->string('menu_label', 120)->nullable()->after('slug');
        });
    }

    public function down(): void
    {
        Schema::table('home_stay_items', function (Blueprint $table) {
            $table->dropColumn('menu_label');
        });
    }
};
