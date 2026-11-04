<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EnquiryService;
use Illuminate\Http\Request;

class EnquiryController extends Controller
{
    public function __construct(
        private EnquiryService $enquiryService
    ) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'phone' => 'required|string|max:25',
            'email' => 'nullable|email|max:255',
            'message' => 'required|string|max:2000',
        ]);

        $enquiry = $this->enquiryService->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Enquiry submitted successfully.',
            'data' => $enquiry,
        ], 201);
    }
}
