<?php

namespace App\Http\Requests\Contact;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateContactPageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Add Admin authorization middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            
            'banner_image' => [
                'sometimes', 'nullable', 'image',
                'mimes:jpg,jpeg,png,webp', 'max:5120',
            ],

            'heading_one' => ['sometimes', 'nullable', 'string', 'max:255'],
            'heading_two' => ['sometimes', 'nullable', 'string', 'max:255'],
            'heading_highlight' => ['sometimes', 'nullable', 'string', 'max:255'],

            'connect_with_us' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'connect_with_us_supporting_text' => [
                'sometimes', 'nullable', 'string', 'max:20000',
            ],

            'connect_with_us_image_one' => [
                'sometimes', 'nullable', 'image',
                'mimes:jpg,jpeg,png,webp', 'max:5120',
            ],
            'connect_with_us_image_two' => [
                'sometimes', 'nullable', 'image',
                'mimes:jpg,jpeg,png,webp', 'max:5120',
            ],

            'subtitle_one' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'subtitle_two' => ['sometimes', 'nullable', 'string', 'max:5000'],

            'send_us_message_text' => [
                'sometimes', 'nullable', 'string', 'max:20000',
            ],
            'until_we_meet_text' => [
                'sometimes', 'nullable', 'string', 'max:20000',
            ],

            'until_we_meet_video' => [
                'sometimes', 'nullable', 'file',
                'mimes:mp4,webm,mov', 'max:51200',
            ],
        ];
    }
}
