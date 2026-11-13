<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\StoreContactDetailRequest;
use App\Http\Requests\Contact\UpdateContactDetailRequest;
use App\Http\Resources\ContactDetailResource;
use App\Models\ContactDetail;
use App\Services\ContactDetailService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;

class ContactDetailController extends Controller
{
    public function __construct(
        private ContactDetailService $contactDetailService
    ) {}

    /**
     * List contact details.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $details = $this->contactDetailService->getAll(
            $request->only([
                'search',
                'type',
                'is_active',
                'per_page',
            ])
        );

        return ContactDetailResource::collection($details);
    }

    /**
     * Store a new contact detail.
     */
    public function store(
        StoreContactDetailRequest $request
    ): JsonResponse {
        $detail = $this->contactDetailService->create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Contact detail created successfully.',
            'data' => new ContactDetailResource($detail),
        ], 201);
    }

    /**
     * Show a single contact detail.
     */
    public function show(ContactDetail $contactDetail): ContactDetailResource
    {
        return new ContactDetailResource($contactDetail);
    }

    /**
     * Update contact detail.
     */
    public function update(
        UpdateContactDetailRequest $request,
        ContactDetail $contactDetail
    ): JsonResponse {
        $detail = $this->contactDetailService->update(
            $contactDetail,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Contact detail updated successfully.',
            'data' => new ContactDetailResource($detail),
        ]);
    }

    /**
     * Delete contact detail.
     */
    public function destroy(ContactDetail $contactDetail): JsonResponse
    {
        $this->contactDetailService->delete($contactDetail);

        return response()->json([
            'success' => true,
            'message' => 'Contact detail deleted successfully.',
        ]);
    }

    /* *
     * Public API: List contact details.
     */
    public function indexPublic(): AnonymousResourceCollection
    {
        $details = $this->contactDetailService->getAll([
            'is_active' => true,
        ]);   
        return ContactDetailResource::collection($details);
    }
}
