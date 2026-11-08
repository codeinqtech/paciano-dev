<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('google_places', function (Blueprint $table) {
            $table->id();
            $table->string('place_id', 80)->unique();
            $table->string('display_name', 200)->nullable();
            $table->decimal('rating', 3, 2)->nullable();
            $table->unsignedInteger('user_rating_count')->nullable();
            $table->string('maps_url', 500)->nullable();
            $table->string('photo_url', 500)->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->text('last_sync_error')->nullable();
            $table->timestamps();
        });

        Schema::create('google_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('google_place_id')->constrained('google_places')->cascadeOnDelete();
            $table->string('source_fingerprint', 64)->unique();
            $table->string('author_name', 200);
            $table->string('author_url', 500)->nullable();
            $table->text('profile_photo_url')->nullable();
            $table->unsignedTinyInteger('rating')->default(0);
            $table->text('review_text')->nullable();
            $table->string('language', 12)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->text('owner_reply')->nullable();
            $table->timestamp('owner_reply_at')->nullable();
            $table->json('photo_urls')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->boolean('imported_from_legacy')->default(false);
            $table->timestamps();

            $table->index(['google_place_id', 'is_approved']);
            $table->index(['published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('google_reviews');
        Schema::dropIfExists('google_places');
    }
};
