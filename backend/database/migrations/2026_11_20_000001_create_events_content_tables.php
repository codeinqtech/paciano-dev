<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events_landings', function (Blueprint $table) {
            $table->id();
            $table->string('hero_kicker', 120)->nullable();
            $table->string('hero_title_main', 200)->nullable();
            $table->string('hero_title_accent', 200)->nullable();
            $table->text('hero_description')->nullable();
            $table->string('hero_banner_path', 500)->nullable();
            $table->timestamps();
        });

        Schema::create('events_landing_type_previews', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 32)->unique();
            $table->string('eyebrow', 120)->nullable();
            $table->string('title_main', 200)->nullable();
            $table->string('title_accent', 200)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('events_landing_advantage_slides', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200)->nullable();
            $table->text('description')->nullable();
            $table->string('image_path', 500)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('events_category_pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 32)->unique();
            $table->string('hero_event_type', 120)->nullable();
            $table->string('hero_title_line1', 200)->nullable();
            $table->string('hero_title_line2', 200)->nullable();
            $table->text('hero_description')->nullable();
            $table->string('hero_image_path', 500)->nullable();
            $table->string('hero_cta_text', 120)->nullable();
            $table->string('hero_cta_href', 300)->nullable();
            $table->string('advantage_eyebrow', 120)->nullable();
            $table->string('advantage_title_line1', 200)->nullable();
            $table->string('advantage_title_line2', 200)->nullable();
            $table->text('advantage_description')->nullable();
            $table->string('venues_eyebrow', 120)->nullable();
            $table->string('venues_title1', 200)->nullable();
            $table->string('venues_title2', 200)->nullable();
            $table->text('venues_description')->nullable();
            $table->timestamps();
        });

        Schema::create('events_category_experience_items', function (Blueprint $table) {
            $table->id();
            $table->string('category_slug', 32);
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('icon_key', 40)->nullable();
            $table->string('image_path', 500)->nullable();
            $table->boolean('show_on_landing')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category_slug', 'sort_order']);
        });

        Schema::create('events_category_venue_items', function (Blueprint $table) {
            $table->id();
            $table->string('category_slug', 32);
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('image_path', 500)->nullable();
            $table->string('capacity', 120)->nullable();
            $table->string('setup', 120)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category_slug', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events_category_venue_items');
        Schema::dropIfExists('events_category_experience_items');
        Schema::dropIfExists('events_category_pages');
        Schema::dropIfExists('events_landing_advantage_slides');
        Schema::dropIfExists('events_landing_type_previews');
        Schema::dropIfExists('events_landings');
    }
};