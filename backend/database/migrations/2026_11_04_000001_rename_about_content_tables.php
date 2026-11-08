<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('home_experience_items')) {
            Schema::rename('home_experience_items', 'about_experience_items');
        }

        if (Schema::hasTable('home_experience_sections')) {
            Schema::rename('home_experience_sections', 'about_experience_sections');
        }

        if (Schema::hasTable('home_about_sections')) {
            Schema::rename('home_about_sections', 'about_intro');
        }

        if (Schema::hasTable('about_intro')) {
            Schema::table('about_intro', function (Blueprint $table) {
                if (! Schema::hasColumn('about_intro', 'home_tagline')) {
                    $table->text('home_tagline')->nullable()->after('paragraph_1');
                }
                if (! Schema::hasColumn('about_intro', 'about_paragraph_2')) {
                    $table->text('about_paragraph_2')->nullable()->after('home_tagline');
                }
                if (! Schema::hasColumn('about_intro', 'home_button_label')) {
                    $table->string('home_button_label', 120)->nullable()->after('about_paragraph_2');
                }
                if (! Schema::hasColumn('about_intro', 'home_button_url')) {
                    $table->string('home_button_url', 500)->nullable()->after('home_button_label');
                }
            });

            if (Schema::hasColumn('about_intro', 'paragraph_2')) {
                DB::table('about_intro')->whereNotNull('paragraph_2')->update([
                    'home_tagline' => DB::raw('paragraph_2'),
                ]);
                Schema::table('about_intro', function (Blueprint $table) {
                    $table->dropColumn('paragraph_2');
                });
            }

            DB::table('about_intro')->whereNull('about_paragraph_2')->update([
                'about_paragraph_2' => 'Nestled in serene landscapes of Dooars, our retreat is thoughtfully designed for those who seek a deeper connection with nature, meaningful experiences and time that truly belongs to themselves.',
            ]);

            DB::table('about_intro')->whereNull('home_button_label')->update([
                'home_button_label' => 'Discover Our Story',
                'home_button_url' => '/about',
            ]);
        }

        if (! Schema::hasTable('about_content_blocks')) {
            Schema::create('about_content_blocks', function (Blueprint $table) {
                $table->id();
                $table->string('section_key', 64)->unique();
                $table->string('eyebrow', 200)->nullable();
                $table->string('heading_line_1', 300)->nullable();
                $table->string('heading_line_2', 300)->nullable();
                $table->string('heading_accent', 300)->nullable();
                $table->text('body_text')->nullable();
                $table->string('image_name', 255)->nullable();
                $table->string('image_path', 500)->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('about_value_items')) {
            Schema::create('about_value_items', function (Blueprint $table) {
                $table->id();
                $table->string('title', 200);
                $table->text('description')->nullable();
                $table->string('icon_key', 40)->default('nature');
                $table->unsignedInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index(['is_active', 'sort_order']);
            });
        }

        $this->seedDefaults();
    }

    private function seedDefaults(): void
    {
        if (Schema::hasTable('about_content_blocks')) {
            $blocks = [
                'story' => [
                    'eyebrow' => 'The Paciano Story',
                    'heading_line_1' => 'Where Moments Linger',
                    'heading_line_2' => null,
                    'heading_accent' => 'Where Nature Embraces You.',
                    'body_text' => "Paciano was created for moments that bring you closer to nature, to the people you travel with, and to yourself. From quiet mornings shaped by the landscape to evenings made memorable by thoughtful hospitality, every stay invites you to slow down and discover what truly matters.\n\nDiscover a quieter kind of luxury, where thoughtful details and genuine warmth make every moment feel personal.",
                ],
                'our_place' => [
                    'eyebrow' => 'OUR PLACE',
                    'heading_line_1' => 'The Enchanting',
                    'heading_line_2' => 'Dooars.',
                    'heading_accent' => 'Rivers, Forests, and Endless Horizons.',
                    'body_text' => 'Where rivers wind through ancient forests and mist settles over distant hills, the Dooars invites you to slow down and reconnect with the natural world. Here, every horizon holds a story waiting to unfold.',
                ],
            ];

            foreach ($blocks as $key => $attrs) {
                DB::table('about_content_blocks')->updateOrInsert(
                    ['section_key' => $key],
                    array_merge($attrs, [
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]),
                );
            }
        }

        if (Schema::hasTable('about_value_items') && DB::table('about_value_items')->count() === 0) {
            $values = [
                ['title' => 'Nature at the Heart', 'description' => 'Surrounded by rivers, forests and endless horizons.', 'icon_key' => 'nature', 'sort_order' => 10],
                ['title' => 'Thoughtful Design', 'description' => 'Spaces that blend naturally with the landscape.', 'icon_key' => 'design', 'sort_order' => 20],
                ['title' => 'Warm Hospitality', 'description' => 'Genuine care in every detail of your stay.', 'icon_key' => 'hospitality', 'sort_order' => 30],
                ['title' => 'Meaningful Experiences', 'description' => 'Moments that help you slow down and reconnect.', 'icon_key' => 'experiences', 'sort_order' => 40],
            ];

            foreach ($values as $row) {
                DB::table('about_value_items')->insert(array_merge($row, [
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('about_value_items');
        Schema::dropIfExists('about_content_blocks');

        if (Schema::hasTable('about_intro')) {
            Schema::table('about_intro', function (Blueprint $table) {
                if (! Schema::hasColumn('about_intro', 'paragraph_2')) {
                    $table->text('paragraph_2')->nullable();
                }
            });
            DB::table('about_intro')->update([
                'paragraph_2' => DB::raw('home_tagline'),
            ]);
            Schema::table('about_intro', function (Blueprint $table) {
                $table->dropColumn(['home_tagline', 'about_paragraph_2', 'home_button_label', 'home_button_url']);
            });
            Schema::rename('about_intro', 'home_about_sections');
        }

        if (Schema::hasTable('about_experience_items')) {
            Schema::rename('about_experience_items', 'home_experience_items');
        }

        if (Schema::hasTable('about_experience_sections')) {
            Schema::rename('about_experience_sections', 'home_experience_sections');
        }
    }
};
