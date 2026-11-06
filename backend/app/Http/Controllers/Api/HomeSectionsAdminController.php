<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AboutContentBlock;
use App\Models\AboutExperienceItem;
use App\Models\AboutExperienceSection;
use App\Models\AboutIntro;
use App\Models\AboutValueItem;
use App\Models\HomeDiningSection;
use App\Models\HomeDiningSlide;
use App\Models\HomeStayItem;
use App\Models\HomeStaysSection;
use App\Models\User;
use App\Services\HomeMediaService;
use App\Support\AboutIntroWordLimits;
use App\Support\MediaUploadLimits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class HomeSectionsAdminController extends Controller
{
    public function __construct(private HomeMediaService $media) {}

    public function aboutShow(Request $request)
    {
        $this->ensurePermission($request, 'about');

        return response()->json([
            'success' => true,
            'data' => AboutIntro::singleton()->toPublicArray(),
        ]);
    }

    public function aboutUpdate(Request $request)
    {
        $this->ensurePermission($request, 'about');

        $data = $request->validate([
            'heading_line_1' => ['nullable', 'string', 'max:200'],
            'heading_line_2' => ['nullable', 'string', 'max:200'],
            'heading_accent' => ['nullable', 'string', 'max:200'],
            'paragraph_1' => ['required', 'string', 'max:5000'],
            'paragraph_2' => ['nullable', 'string', 'max:5000'],
            'home_tagline' => ['nullable', 'string', 'max:2000'],
            'photo_left' => MediaUploadLimits::imageFileRules(),
            'photo_center' => MediaUploadLimits::imageFileRules(),
            'photo_right' => MediaUploadLimits::imageFileRules(),
        ]);

        $wordErrors = AboutIntroWordLimits::validateIntro(
            $data['paragraph_1'] ?? null,
            $data['paragraph_2'] ?? null,
            $data['home_tagline'] ?? null,
        );
        if ($wordErrors !== null) {
            throw ValidationException::withMessages($wordErrors);
        }

        $row = AboutIntro::singleton();

        foreach (['photo_left', 'photo_center', 'photo_right'] as $slot) {
            if ($request->hasFile($slot)) {
                $pathKey = $slot.'_path';
                $nameKey = $slot.'_name';
                $this->media->deletePublicFile($row->{$pathKey});
                $stored = $this->media->storeHomeSectionImage($request->file($slot), 'about');
                $row->{$nameKey} = $stored['file_name'];
                $row->{$pathKey} = $stored['file_path'];
            }
        }

        $row->fill([
            'heading_line_1' => $data['heading_line_1'] ?? $row->heading_line_1,
            'heading_line_2' => $data['heading_line_2'] ?? $row->heading_line_2,
            'heading_accent' => $data['heading_accent'] ?? $row->heading_accent,
            'paragraph_1' => $data['paragraph_1'] ?? $row->paragraph_1,
            'paragraph_2' => $data['paragraph_2'] ?? $row->paragraph_2,
            'home_tagline' => $data['home_tagline'] ?? $row->home_tagline,
        ]);
        $row->save();

        return response()->json(['success' => true, 'data' => $row->fresh()->toPublicArray()]);
    }

    public function aboutPageAdmin(Request $request)
    {
        $this->ensurePermission($request, 'about');

        $blocks = Schema::hasTable('about_content_blocks')
            ? AboutContentBlock::query()->get()->mapWithKeys(fn (AboutContentBlock $b) => [
                $b->section_key => $b->toPublicArray(),
            ])
            : collect();

        $values = Schema::hasTable('about_value_items')
            ? AboutValueItem::query()->orderBy('sort_order')->orderBy('id')->get()->map(
                fn (AboutValueItem $v) => $v->toPublicArray(),
            )
            : collect();

        $section = AboutExperienceSection::singleton();
        $items = AboutExperienceItem::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (AboutExperienceItem $i) => $i->toPublicArray());

        return response()->json([
            'success' => true,
            'data' => [
                'intro' => AboutIntro::singleton()->toPublicArray(),
                'experiences' => [
                    'section' => $section->toPublicArray(),
                    'items' => $items,
                ],
                'blocks' => $blocks,
                'values' => $values,
            ],
        ]);
    }

    public function aboutBlockUpdate(Request $request, string $sectionKey)
    {
        $this->ensurePermission($request, 'about');

        if (! in_array($sectionKey, ['story', 'our_place'], true)) {
            abort(404);
        }

        $data = $request->validate([
            'eyebrow' => ['nullable', 'string', 'max:200'],
            'heading_line_1' => ['nullable', 'string', 'max:300'],
            'heading_line_2' => ['nullable', 'string', 'max:300'],
            'heading_accent' => ['nullable', 'string', 'max:300'],
            'body_text' => ['nullable', 'string', 'max:8000'],
            'photo' => MediaUploadLimits::imageFileRules(),
        ]);

        $row = AboutContentBlock::forKey($sectionKey);

        if ($sectionKey === 'our_place' && $request->hasFile('photo')) {
            throw ValidationException::withMessages([
                'photo' => 'The Our Place background image is fixed and cannot be changed here.',
            ]);
        }

        if ($request->hasFile('photo')) {
            $this->media->deletePublicFile($row->image_path);
            $stored = $this->media->storeHomeSectionImage($request->file('photo'), 'about');
            $row->image_name = $stored['file_name'];
            $row->image_path = $stored['file_path'];
        }

        $row->fill($data);
        $row->save();

        return response()->json(['success' => true, 'data' => $row->fresh()->toPublicArray()]);
    }

    public function aboutValueUpdate(Request $request, int $id)
    {
        $this->ensurePermission($request, 'about');

        $item = AboutValueItem::query()->where('is_active', true)->findOrFail($id);
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'icon_key' => ['sometimes', 'string', 'in:nature,design,hospitality,experiences'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $item->fill($data);
        $item->save();

        return response()->json(['success' => true, 'data' => $item->fresh()->toPublicArray()]);
    }

    public function experiencesShow(Request $request)
    {
        $this->ensurePermission($request, 'about');

        $section = AboutExperienceSection::singleton();
        $items = AboutExperienceItem::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (AboutExperienceItem $i) => $i->toPublicArray());

        return response()->json([
            'success' => true,
            'data' => [
                'section' => $section->toPublicArray(),
                'items' => $items,
            ],
        ]);
    }

    public function experiencesSectionUpdate(Request $request)
    {
        $this->ensurePermission($request, 'about');

        $data = $request->validate([
            'heading_main' => ['nullable', 'string', 'max:300'],
            'heading_accent' => ['nullable', 'string', 'max:300'],
        ]);

        $row = AboutExperienceSection::singleton();
        $row->update($data);

        return response()->json(['success' => true, 'data' => $row->fresh()]);
    }

    public function experienceItemUpdate(Request $request, int $id)
    {
        $this->ensurePermission($request, 'about');

        $item = AboutExperienceItem::query()->where('is_active', true)->findOrFail($id);
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'photo' => MediaUploadLimits::imageFileRules(),
        ]);

        if ($request->hasFile('photo')) {
            $this->media->deletePublicFile($item->image_path);
            $stored = $this->media->storeHomeSectionImage($request->file('photo'), 'experiences');
            $item->image_name = $stored['file_name'];
            $item->image_path = $stored['file_path'];
        }

        $item->fill($data);
        $item->save();

        return response()->json(['success' => true, 'data' => $item->fresh()->toPublicArray()]);
    }

    public function staysShow(Request $request)
    {
        $this->ensurePermission($request, 'stays');

        $section = HomeStaysSection::singleton();
        $items = HomeStayItem::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (HomeStayItem $i) => $i->toPublicArray());

        return response()->json([
            'success' => true,
            'data' => [
                'section' => $section->toPublicArray(),
                'items' => $items,
            ],
        ]);
    }

    public function staysSectionUpdate(Request $request)
    {
        $this->ensurePermission($request, 'stays');

        $data = $request->validate([
            'heading_main' => ['nullable', 'string', 'max:300'],
            'heading_accent' => ['nullable', 'string', 'max:300'],
            'intro_text' => ['nullable', 'string', 'max:5000'],
        ]);

        $row = HomeStaysSection::singleton();
        $row->update($data);

        return response()->json(['success' => true, 'data' => $row->fresh()]);
    }

    public function stayItemUpdate(Request $request, int $id)
    {
        $this->ensurePermission($request, 'stays');

        $item = HomeStayItem::query()->where('is_active', true)->findOrFail($id);
        $data = $request->validate([
            'menu_label' => ['nullable', 'string', 'max:120'],
            'button_descriptor' => ['nullable', 'string', 'max:120'],
            'title' => ['sometimes', 'string', 'max:200'],
            'photo_label' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:5000'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'photo_1' => MediaUploadLimits::imageFileRules(),
            'photo_2' => MediaUploadLimits::imageFileRules(),
            'photo_3' => MediaUploadLimits::imageFileRules(),
        ]);

        foreach (['photo_1', 'photo_2', 'photo_3'] as $slot) {
            if ($request->hasFile($slot)) {
                $pathKey = $slot.'_path';
                $nameKey = $slot.'_name';
                $this->media->deletePublicFile($item->{$pathKey});
                $stored = $this->media->storeHomeSectionImage($request->file($slot), 'stays');
                $item->{$nameKey} = $stored['file_name'];
                $item->{$pathKey} = $stored['file_path'];
            }
        }

        $item->fill($data);
        $item->save();

        return response()->json(['success' => true, 'data' => $item->fresh()->toPublicArray()]);
    }

    public function diningShow(Request $request)
    {
        $this->ensurePermission($request, 'dining');

        $section = HomeDiningSection::singleton();
        $slides = HomeDiningSlide::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (HomeDiningSlide $s) => $s->toPublicArray());

        return response()->json([
            'success' => true,
            'data' => [
                'section' => $section->toPublicArray(),
                'slides' => $slides,
            ],
        ]);
    }

    public function diningSectionUpdate(Request $request)
    {
        $this->ensurePermission($request, 'dining');

        $data = $request->validate([
            'heading_line_1' => ['nullable', 'string', 'max:200'],
            'heading_line_2' => ['nullable', 'string', 'max:200'],
            'heading_accent' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        $row = HomeDiningSection::singleton();
        $row->update($data);

        return response()->json(['success' => true, 'data' => $row->fresh()]);
    }

    public function diningSlideUpdate(Request $request, int $id)
    {
        $this->ensurePermission($request, 'dining');

        $slide = HomeDiningSlide::query()->where('is_active', true)->findOrFail($id);
        $data = $request->validate([
            'quote' => ['nullable', 'string', 'max:2000'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'photo' => MediaUploadLimits::imageFileRules(),
        ]);

        if ($request->hasFile('photo')) {
            $this->media->deletePublicFile($slide->image_path);
            $stored = $this->media->storeHomeSectionImage($request->file('photo'), 'dining');
            $slide->image_name = $stored['file_name'];
            $slide->image_path = $stored['file_path'];
        }

        $slide->fill($data);
        $slide->save();

        return response()->json(['success' => true, 'data' => $slide->fresh()->toPublicArray()]);
    }

    private function ensurePermission(Request $request, string $menuId): void
    {
        /** @var User|null $user */
        $user = $request->user();
        if (! $user) {
            abort(401);
        }
        if (! $user->isSuperAdmin() && ! $user->hasMenuPermission($menuId)) {
            abort(403, 'You do not have permission to manage this section.');
        }
    }
}
