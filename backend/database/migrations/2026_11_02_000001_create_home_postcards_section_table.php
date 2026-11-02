<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_postcards_settings', function (Blueprint $table) {
            $table->id();
            $table->string('section_label', 120)->nullable();
            $table->string('heading_primary', 200)->nullable();
            $table->string('heading_accent', 200)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_postcards_settings');
    }
};
