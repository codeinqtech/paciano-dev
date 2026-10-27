<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class IndianPhone implements ValidationRule
{
    public function __construct(private bool $optional = false) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null || $value === '') {
            if ($this->optional) {
                return;
            }
            $fail('The :attribute field is required.');

            return;
        }

        $digits = preg_replace('/\D+/', '', (string) $value);
        if ($digits === null || strlen($digits) < 10 || strlen($digits) > 13) {
            $fail('Enter a valid phone number.');
        }
    }
}
