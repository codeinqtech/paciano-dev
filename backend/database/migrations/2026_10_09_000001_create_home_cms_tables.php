<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_banner_slides', function (Blueprint $table) {
            $table->id();
            $table->string('media_type', 16);
            $table->string('file_name', 255);
            $table->string('file_path', 500);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('file_name');
            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('home_location_settings', function (Blueprint $table) {
            $table->id();
            $table->string('eyebrow', 120)->nullable();
            $table->string('heading_primary', 200)->nullable();
            $table->string('heading_accent', 200)->nullable();
            $table->text('description')->nullable();
            $table->string('landscape_image_name', 255)->nullable();
            $table->string('landscape_image_path', 500)->nullable();
            $table->json('feature_labels')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('home_review_videos', function (Blueprint $table) {
            $table->id();
            $table->string('reviewer_name', 120);
            $table->string('location', 200);
            $table->string('display_title', 200)->nullable();
            $table->string('thumbnail_name', 255);
            $table->string('thumbnail_path', 500);
            $table->string('video_name', 255);
            $table->string('video_path', 500);
            $table->unsignedSmallInteger('upload_year');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('thumbnail_name');
            $table->unique('video_name');
            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_review_videos');
        Schema::dropIfExists('home_location_settings');
        Schema::dropIfExists('home_banner_slides');
    }
};
