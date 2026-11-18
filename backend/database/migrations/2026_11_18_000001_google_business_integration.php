<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('google_business_credentials', function (Blueprint $table) {
            $table->id();
            $table->text('refresh_token')->nullable();
            $table->text('access_token')->nullable();
            $table->timestamp('access_token_expires_at')->nullable();
            $table->string('scope', 500)->nullable();
            $table->timestamp('connected_at')->nullable();
            $table->timestamps();
        });

        Schema::table('google_reviews', function (Blueprint $table) {
            $table->string('google_review_id', 120)->nullable()->after('source_fingerprint');
            $table->text('review_reply_url')->nullable()->after('owner_reply_at');

            $table->unique('google_review_id');
        });
    }

    public function down(): void
    {
        Schema::table('google_reviews', function (Blueprint $table) {
            $table->dropUnique(['google_review_id']);
            $table->dropColumn(['google_review_id', 'review_reply_url']);
        });

        Schema::dropIfExists('google_business_credentials');
    }
};