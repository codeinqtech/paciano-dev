<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_about_sections', function (Blueprint $table) {
            $table->id();
            $table->string('heading_line_1', 200)->nullable();
            $table->string('heading_line_2', 200)->nullable();
            $table->string('heading_accent', 200)->nullable();
            $table->text('paragraph_1')->nullable();
            $table->text('paragraph_2')->nullable();
            $table->string('photo_left_name', 255)->nullable();
            $table->string('photo_left_path', 500)->nullable();
            $table->string('photo_center_name', 255)->nullable();
            $table->string('photo_center_path', 500)->nullable();
            $table->string('photo_right_name', 255)->nullable();
            $table->string('photo_right_path', 500)->nullable();
            $table->timestamps();
        });

        Schema::create('home_experience_sections', function (Blueprint $table) {
            $table->id();
            $table->string('heading_main', 300)->nullable();
            $table->string('heading_accent', 300)->nullable();
            $table->timestamps();
        });

        Schema::create('home_experience_items', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('image_name', 255)->nullable();
            $table->string('image_path', 500)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('home_stays_sections', function (Blueprint $table) {
            $table->id();
            $table->string('heading_main', 300)->nullable();
            $table->string('heading_accent', 300)->nullable();
            $table->text('intro_text')->nullable();
            $table->timestamps();
        });

        Schema::create('home_stay_items', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 80);
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('photo_1_name', 255)->nullable();
            $table->string('photo_1_path', 500)->nullable();
            $table->string('photo_2_name', 255)->nullable();
            $table->string('photo_2_path', 500)->nullable();
            $table->string('photo_3_name', 255)->nullable();
            $table->string('photo_3_path', 500)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('slug');
            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('home_dining_sections', function (Blueprint $table) {
            $table->id();
            $table->string('heading_line_1', 200)->nullable();
            $table->string('heading_line_2', 200)->nullable();
            $table->string('heading_accent', 200)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('home_dining_slides', function (Blueprint $table) {
            $table->id();
            $table->text('quote')->nullable();
            $table->string('image_name', 255)->nullable();
            $table->string('image_path', 500)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_dining_slides');
        Schema::dropIfExists('home_dining_sections');
        Schema::dropIfExists('home_stay_items');
        Schema::dropIfExists('home_stays_sections');
        Schema::dropIfExists('home_experience_items');
        Schema::dropIfExists('home_experience_sections');
        Schema::dropIfExists('home_about_sections');
    }
};
