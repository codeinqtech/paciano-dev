<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\UpdateContactPageRequest;
use App\Http\Resources\ContactPageContentResource;
use App\Services\ContactPageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactPageController extends Controller
{
    public function __construct(
        private ContactPageService $contactPageService
    ) {}

    /**
     * Get contact page content.
     */
    public function show(): ContactPageContentResource
    {
        $content = $this->contactPageService->getContent();

        return new ContactPageContentResource($content);
    }

    /**
     * Update contact page content.
     */
    public function update(
        UpdateContactPageRequest $request
    ): JsonResponse {
        $content = $this->contactPageService->update(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Contact page content updated successfully.',
            'data' => new ContactPageContentResource($content),
        ]);
    }
}
