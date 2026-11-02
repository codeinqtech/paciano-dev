<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('enquiries', function (Blueprint $table) {
            $table->id();

            $table->string('name', 150);
            $table->string('phone', 25);
            $table->string('email')->nullable();
            $table->text('message');

            $table->string('status')->default('new');

            $table->string('whatsapp_status')
                ->default('pending');

            $table->string('whatsapp_message_sid')->nullable();
            $table->text('whatsapp_error')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enquiries');
    }
};
