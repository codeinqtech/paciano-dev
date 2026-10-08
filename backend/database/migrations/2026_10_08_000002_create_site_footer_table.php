<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_footer', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 32);
            $table->text('intro_paragraph')->nullable();
            $table->string('map_address', 500)->nullable();
            $table->decimal('map_latitude', 11, 8)->nullable();
            $table->decimal('map_longitude', 11, 8)->nullable();
            $table->string('location_eyebrow', 120)->nullable();
            $table->string('location_heading', 200)->nullable();
            $table->string('location_subtitle', 200)->nullable();
            $table->text('location_description')->nullable();
            $table->string('maps_link', 500)->nullable();
            $table->string('platform', 50)->nullable();
            $table->string('url', 500)->nullable();
            $table->string('info_label', 120)->nullable();
            $table->text('info_value')->nullable();
            $table->string('info_icon', 40)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['kind', 'is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_footer');
    }
};
