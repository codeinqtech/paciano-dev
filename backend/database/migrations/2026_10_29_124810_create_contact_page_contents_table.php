
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_page_contents', function (Blueprint $table) {
            $table->id();

            $table->string('banner_image')->nullable();
            $table->string('heading_one')->nullable();
            $table->string('heading_two')->nullable();
            $table->string('heading_highlight')->nullable();

            $table->text('connect_with_us')->nullable();
            $table->longText('connect_with_us_supporting_text')->nullable();

            $table->string('connect_with_us_image_one')->nullable();
            $table->string('connect_with_us_image_two')->nullable();

            $table->text('subtitle_one')->nullable();
            $table->text('subtitle_two')->nullable();

            $table->longText('send_us_message_text')->nullable();
            $table->longText('until_we_meet_text')->nullable();
            $table->string('until_we_meet_video')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_page_contents');
    }
};
