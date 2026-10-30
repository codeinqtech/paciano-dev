
<?php

namespace App\Http\Requests\Contact;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactDetailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Add Admin authorization middleware
    }

    public function rules(): array
    {
        return [
            'type' => [
                'required',
                'string',
                Rule::in(['phone', 'email', 'address', 'map', 'other']),
            ],
            'label' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string', 'max:5000'],
            'icon' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
