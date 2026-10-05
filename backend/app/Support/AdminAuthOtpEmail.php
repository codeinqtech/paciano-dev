<?php

namespace App\Support;

class AdminAuthOtpEmail
{
    /**
     * @return array<string, mixed>
     */
    public static function viewData(string $otp, int $ttlMinutes): array
    {
        return [
            'otp' => $otp,
            'ttlMinutes' => $ttlMinutes,
            'appName' => config('app.name', 'Paciano'),
        ];
    }

    public static function changePasswordSubject(): string
    {
        return config('app.name', 'Paciano').' — Change password OTP';
    }

    public static function forgotPasswordSubject(): string
    {
        return config('app.name', 'Paciano').' — Password reset OTP';
    }
}
