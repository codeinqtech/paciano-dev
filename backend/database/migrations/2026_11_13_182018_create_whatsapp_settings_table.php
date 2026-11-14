<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_settings', function (Blueprint $table) {
            $table->id();

            $table->string('api_version')->default('v25.0');

            $table->string('phone_number_id')->nullable();

            $table->string('business_account_id')->nullable();

            $table->text('access_token')->nullable();

            $table->string('recipient')->nullable();

            $table->string('template_name')->default('paciano_new_enquiry');

            $table->string('template_language')->default('en');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_settings');
    }
};
