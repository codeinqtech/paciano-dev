<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeBannerSlide;
use App\Models\HomeLocationSetting;
use App\Models\HomeReviewVideo;
use App\Models\User;
use App\Services\HomeMediaService;
use Illuminate\Http\Request;

class HomeAdminController extends Controller
{
    public function __construct(private HomeMediaService $media) {}

    public function bannerIndex(Request $request)
    {
        $this->ensureHomePermission($request);

        $items = HomeBannerSlide::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (HomeBannerSlide $s) => [
                'id' => $s->id,
                'media_type' => $s->media_type,
                'file_name' => $s->file_name,
                'file_path' => $s->file_path,
                'url' => $this->media->publicUrl($s->file_path),
                'sort_order' => $s->sort_order,
            ]);

        return response()->json(['success' => true, 'data' => $items]);
    }

    public function bannerStore(Request $request)
    {
        $this->ensureHomePermission($request);

        $data = $request->validate([
            'media_type' => ['required', 'in:image,video'],
            'file' => ['required', 'file', 'max:102400'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $type = $data['media_type'];
        /** @var \Illuminate\Http\UploadedFile $file */
        $file = $data['file'];

        if ($type === 'image') {
            $stored = $this->media->storeBannerImage($file);
        } else {
            $stored = $this->media->storeBannerVideo($file);
        }

        $slide = HomeBannerSlide::query()->create([
            'media_type' => $type,
            'file_name' => $stored['file_name'],
            'file_path' => $stored['file_path'],
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $slide->toPublicArray(),
        ], 201);
    }

    public function bannerUpdate(Request $request, int $id)
    {
        $this->ensureHomePermission($request);

        $slide = $this->findActiveBanner($id);
        $data = $request->validate([
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $slide->update($data);

        return response()->json(['success' => true, 'data' => $slide->fresh()->toPublicArray()]);
    }

    public function bannerDestroy(Request $request, int $id)
    {
        $this->ensureHomePermission($request);

        $slide = $this->findActiveBanner($id);
        $slide->update(['is_active' => false]);

        return response()->json(['success' => true, 'message' => 'Banner slide removed.']);
    }

    public function locationShow(Request $request)
    {
        $this->ensureHomePermission($request);

        $row = HomeLocationSetting::singleton();

        return response()->json([
            'success' => true,
            'data' => array_merge($row->toPublicArray(), [
                'landscape_image_path' => $row->landscape_image_path,
            ]),
        ]);
    }

    public function locationUpdate(Request $request)
    {
        $this->ensureHomePermission($request);

        if ($request->has('feature_labels') && is_string($request->input('feature_labels'))) {
            $decoded = json_decode($request->input('feature_labels'), true);
            if (is_array($decoded)) {
                $request->merge(['feature_labels' => $decoded]);
            }
        }

        $data = $request->validate([
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'heading_primary' => ['nullable', 'string', 'max:200'],
            'heading_accent' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:5000'],
            'feature_labels' => ['nullable', 'array', 'max:4'],
            'feature_labels.*.line1' => ['required_with:feature_labels', 'string', 'max:80'],
            'feature_labels.*.line2' => ['nullable', 'string', 'max:80'],
            'landscape_image' => ['nullable', 'file', 'max:51200'],
        ]);

        $row = HomeLocationSetting::singleton();

        if ($request->hasFile('landscape_image')) {
            $this->media->deletePublicFile($row->landscape_image_path);
            $stored = $this->media->storeLocationLandscape($request->file('landscape_image'));
            $row->landscape_image_name = $stored['file_name'];
            $row->landscape_image_path = $stored['file_path'];
        }

        $row->fill([
            'eyebrow' => $data['eyebrow'] ?? $row->eyebrow,
            'heading_primary' => $data['heading_primary'] ?? $row->heading_primary,
            'heading_accent' => $data['heading_accent'] ?? $row->heading_accent,
            'description' => $data['description'] ?? $row->description,
        ]);

        if (isset($data['feature_labels'])) {
            $row->feature_labels = $data['feature_labels'];
        }

        $row->save();

        return response()->json(['success' => true, 'data' => $row->fresh()->toPublicArray()]);
    }

    public function reviewIndex(Request $request)
    {
        $this->ensureHomePermission($request);

        $items = HomeReviewVideo::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (HomeReviewVideo $v) => array_merge($v->toPublicArray(), [
                'video_name' => $v->video_name,
                'thumbnail_name' => $v->thumbnail_name,
            ]));

        return response()->json(['success' => true, 'data' => $items]);
    }

    public function reviewStore(Request $request)
    {
        $this->ensureHomePermission($request);

        $data = $request->validate([
            'reviewer_name' => ['required', 'string', 'max:120'],
            'location' => ['required', 'string', 'max:200'],
            'display_title' => ['nullable', 'string', 'max:200'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'thumbnail' => ['nullable', 'file', 'max:20480'],
            'video' => ['required', 'file', 'max:102400'],
        ]);

        $year = (int) now()->format('Y');
        $video = $this->media->storeReviewVideo($data['video'], $year);

        if ($request->hasFile('thumbnail')) {
            $thumb = $this->media->storeReviewThumbnail($request->file('thumbnail'), $year);
        } else {
            $thumb = $this->media->storeReviewThumbnailFromVideo($video['file_path'], $year);
        }

        $item = HomeReviewVideo::query()->create([
            'reviewer_name' => trim($data['reviewer_name']),
            'location' => trim($data['location']),
            'display_title' => isset($data['display_title']) ? trim($data['display_title']) : null,
            'thumbnail_name' => $thumb['file_name'],
            'thumbnail_path' => $thumb['file_path'],
            'video_name' => $video['file_name'],
            'video_path' => $video['file_path'],
            'upload_year' => $year,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        return response()->json(['success' => true, 'data' => $item->toPublicArray()], 201);
    }

    public function reviewUpdate(Request $request, int $id)
    {
        $this->ensureHomePermission($request);

        $item = $this->findActiveReview($id);
        $data = $request->validate([
            'reviewer_name' => ['sometimes', 'string', 'max:120'],
            'location' => ['sometimes', 'string', 'max:200'],
            'display_title' => ['nullable', 'string', 'max:200'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'thumbnail' => ['nullable', 'file', 'max:20480'],
            'video' => ['nullable', 'file', 'max:102400'],
        ]);

        if ($request->hasFile('thumbnail')) {
            $this->media->deletePublicFile($item->thumbnail_path);
            $thumb = $this->media->storeReviewThumbnail($request->file('thumbnail'), $item->upload_year);
            $item->thumbnail_name = $thumb['file_name'];
            $item->thumbnail_path = $thumb['file_path'];
        }

        if ($request->hasFile('video')) {
            $this->media->deletePublicFile($item->video_path);
            $video = $this->media->storeReviewVideo($request->file('video'), $item->upload_year);
            $item->video_name = $video['file_name'];
            $item->video_path = $video['file_path'];

            if (! $request->hasFile('thumbnail')) {
                $this->media->deletePublicFile($item->thumbnail_path);
                $thumb = $this->media->storeReviewThumbnailFromVideo(
                    $video['file_path'],
                    $item->upload_year,
                );
                $item->thumbnail_name = $thumb['file_name'];
                $item->thumbnail_path = $thumb['file_path'];
            }
        }

        if (isset($data['reviewer_name'])) {
            $data['reviewer_name'] = trim($data['reviewer_name']);
        }
        if (isset($data['location'])) {
            $data['location'] = trim($data['location']);
        }

        $item->update($data);

        return response()->json(['success' => true, 'data' => $item->fresh()->toPublicArray()]);
    }

    public function reviewDestroy(Request $request, int $id)
    {
        $this->ensureHomePermission($request);

        $item = $this->findActiveReview($id);
        $item->update(['is_active' => false]);

        return response()->json(['success' => true, 'message' => 'Review video removed.']);
    }

    private function findActiveBanner(int $id): HomeBannerSlide
    {
        return HomeBannerSlide::query()->where('is_active', true)->findOrFail($id);
    }

    private function findActiveReview(int $id): HomeReviewVideo
    {
        return HomeReviewVideo::query()->where('is_active', true)->findOrFail($id);
    }

    private function ensureHomePermission(Request $request): void
    {
        /** @var User|null $user */
        $user = $request->user();
        if (! $user) {
            abort(401);
        }
        if (! $user->isSuperAdmin() && ! $user->hasMenuPermission('homepage')) {
            abort(403, 'You do not have permission to manage homepage content.');
        }
    }
}
