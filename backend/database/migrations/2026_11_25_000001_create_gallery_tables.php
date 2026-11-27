<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_pages', function (Blueprint $table) {
            $table->id();
            $table->string('hero_eyebrow', 120)->nullable();
            $table->string('hero_title', 200)->nullable();
            $table->string('hero_subtitle', 500)->nullable();
            $table->string('hero_banner_path', 500)->nullable();
            $table->string('moments_eyebrow', 120)->nullable();
            $table->string('all_moments_label', 120)->nullable();
            $table->string('closing_image_path', 500)->nullable();
            $table->timestamps();
        });

        Schema::create('gallery_categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('label', 120);
            $table->string('icon_prefix', 16)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_category_id')
                ->constrained('gallery_categories')
                ->cascadeOnDelete();
            $table->string('title', 200)->nullable();
            $table->string('alt_text', 300)->nullable();
            $table->string('image_path', 500)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_items');
        Schema::dropIfExists('gallery_categories');
        Schema::dropIfExists('gallery_pages');
    }
};