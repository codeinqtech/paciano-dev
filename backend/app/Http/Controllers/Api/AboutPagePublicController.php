<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AboutContentBlock;
use App\Models\AboutExperienceItem;
use App\Models\AboutExperienceSection;
use App\Models\AboutIntro;
use App\Models\AboutValueItem;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;

class AboutPagePublicController extends Controller
{
    public function show()
    {
        if (! Schema::hasTable('about_intro') && ! Schema::hasTable('home_about_sections')) {
            return response()->json(['success' => true, 'data' => null]);
        }

        try {
            $intro = AboutIntro::singleton()->toPublicArray();

            $experiences = ['section' => null, 'items' => []];
            if (Schema::hasTable('about_experience_sections') || Schema::hasTable('home_experience_sections')) {
                $experiences = [
                    'section' => AboutExperienceSection::singleton()->toPublicArray(),
                    'items' => AboutExperienceItem::query()
                        ->where('is_active', true)
                        ->orderBy('sort_order')
                        ->orderBy('id')
                        ->get()
                        ->map(fn (AboutExperienceItem $i) => $i->toPublicArray())
                        ->values(),
                ];
            }

            $blocks = [];
            if (Schema::hasTable('about_content_blocks')) {
                $blocks = AboutContentBlock::query()
                    ->get()
                    ->mapWithKeys(fn (AboutContentBlock $b) => [
                        $b->section_key => $b->toPublicArray(),
                    ]);
            }

            $values = [];
            if (Schema::hasTable('about_value_items')) {
                $values = AboutValueItem::query()
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->get()
                    ->map(fn (AboutValueItem $v) => $v->toPublicArray())
                    ->values();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'intro' => $intro,
                    'experiences' => $experiences,
                    'blocks' => $blocks,
                    'values' => $values,
                ],
            ]);
        } catch (QueryException) {
            return response()->json(['success' => true, 'data' => null]);
        }
    }
}
