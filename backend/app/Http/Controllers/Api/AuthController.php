<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AdminAuthOtpEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const OTP_CACHE_PREFIX = 'change_password_otp:';

    private const OTP_RATE_PREFIX = 'change_password_otp_rate:';

    private const FORGOT_OTP_CACHE_PREFIX = 'forgot_password_otp:';

    private const FORGOT_OTP_RATE_PREFIX = 'forgot_password_otp_rate:';

    /**
     * POST /api/auth/login
     * Body: login (email or username/name), password — role comes from the user record in DB
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'login' => ['required_without:email', 'string', 'max:190'],
            'email' => ['required_without:login', 'string', 'max:190'],
            'password' => ['required', 'string'],
        ]);

        $identifier = trim((string) ($data['login'] ?? $data['email'] ?? ''));
        $identifierLower = strtolower($identifier);

        $user = User::query()
            ->where('active', true)
            ->where(function ($query) use ($identifierLower): void {
                $query
                    ->whereRaw('LOWER(email) = ?', [$identifierLower])
                    ->orWhereRaw('LOWER(name) = ?', [$identifierLower])
                    ->orWhereRaw('LOWER(username) = ?', [$identifierLower]);
            })
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Invalid username/email or password.'],
            ]);
        }

        // One token per login session
        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user->toPublicArray(),
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out.',
        ]);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()->toPublicArray(),
        ]);
    }

    /**
     * POST /api/auth/change-password/otp/send
     * Validates current password, emails OTP to the logged-in admin.
     */
    public function sendChangePasswordOtp(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        /** @var User $user */
        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        if (Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['New password must be different from the current password.'],
            ]);
        }

        $rateKey = self::OTP_RATE_PREFIX.$user->id.'|'.$request->ip();
        $sentCount = (int) Cache::get($rateKey, 0);
        if ($sentCount >= 5) {
            abort(429, 'Too many OTP requests. Please try again later.');
        }

        $ttlMinutes = max(1, (int) env('CHANGE_PASSWORD_OTP_TTL_MINUTES', env('ENQUIRY_OTP_TTL_MINUTES', 10)));
        $testOtp = trim((string) env('CHANGE_PASSWORD_TEST_OTP', env('ENQUIRY_TEST_OTP', '')));
        $otp = $testOtp !== '' ? $testOtp : (string) random_int(100000, 999999);
        $verificationToken = (string) Str::uuid();

        Cache::put(self::OTP_CACHE_PREFIX.$verificationToken, [
            'otp_hash' => Hash::make($otp),
            'attempts' => 0,
            'user_id' => $user->id,
            'password' => Crypt::encryptString($data['password']),
        ], now()->addMinutes($ttlMinutes));

        Cache::put($rateKey, $sentCount + 1, now()->addHour());

        if ($testOtp === '') {
            $toEmail = $user->email;
            $fromAddress = (string) env('CHANGE_PASSWORD_OTP_FROM_ADDRESS', env('ENQUIRY_OTP_FROM_ADDRESS', env('MAIL_FROM_ADDRESS', '3genquiry26@gmail.com')));
            $fromName = (string) env('CHANGE_PASSWORD_OTP_FROM_NAME', env('ENQUIRY_OTP_FROM_NAME', env('MAIL_FROM_NAME', env('APP_NAME', '3G Decorative Group'))));
            $mailData = AdminAuthOtpEmail::viewData($otp, $ttlMinutes);
            $subject = AdminAuthOtpEmail::changePasswordSubject();

            dispatch(function () use ($toEmail, $fromAddress, $fromName, $mailData, $subject): void {
                try {
                    Mail::send('emails.change-password-otp', $mailData, function ($message) use ($toEmail, $fromAddress, $fromName, $subject): void {
                        $message
                            ->to($toEmail)
                            ->from($fromAddress, $fromName)
                            ->subject($subject);
                    });
                } catch (\Throwable $e) {
                    report($e);
                    logger()->error('Change password OTP mail failed', [
                        'to' => $toEmail,
                        'error' => $e->getMessage(),
                    ]);
                }
            })->afterResponse();
        }

        return response()->json([
            'success' => true,
            'message' => $testOtp !== ''
                ? 'Test OTP generated successfully.'
                : 'OTP sent to your email address.',
            'verification_token' => $verificationToken,
            'expires_in' => $ttlMinutes * 60,
            'email' => $user->email,
            'test_mode' => $testOtp !== '',
        ]);
    }

    /**
     * POST /api/auth/change-password/otp/verify
     */
    public function verifyChangePasswordOtp(Request $request)
    {
        $data = $request->validate([
            'verification_token' => ['required', 'uuid'],
            'otp' => ['required', 'digits:6'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $key = self::OTP_CACHE_PREFIX.$data['verification_token'];
        $pending = Cache::get($key);

        if (! is_array($pending)) {
            abort(410, 'OTP expired or invalid. Please request a new OTP.');
        }

        if ((int) ($pending['user_id'] ?? 0) !== (int) $user->id) {
            Cache::forget($key);
            abort(403, 'OTP does not match this account.');
        }

        $attempts = (int) ($pending['attempts'] ?? 0);
        $ttlMinutes = max(1, (int) env('CHANGE_PASSWORD_OTP_TTL_MINUTES', env('ENQUIRY_OTP_TTL_MINUTES', 10)));

        if ($attempts >= 5) {
            Cache::forget($key);
            abort(422, 'Too many invalid attempts. Please request a new OTP.');
        }

        if (! Hash::check($data['otp'], (string) ($pending['otp_hash'] ?? ''))) {
            $pending['attempts'] = $attempts + 1;
            Cache::put($key, $pending, now()->addMinutes($ttlMinutes));
            abort(422, 'Invalid OTP. Please try again.');
        }

        try {
            $newPassword = Crypt::decryptString((string) ($pending['password'] ?? ''));
        } catch (\Throwable) {
            Cache::forget($key);
            abort(422, 'Invalid verification payload. Please submit again.');
        }

        $user->update(['password' => $newPassword]);
        Cache::forget($key);

        return response()->json([
            'success' => true,
            'message' => 'Password updated.',
        ]);
    }

    /**
     * POST /api/auth/forgot-password/otp/send
     * Public — admin username + new password; OTP emailed to the user's registered email.
     */
    public function sendForgotPasswordOtp(Request $request)
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:120'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $usernameLower = strtolower(trim($data['username']));

        $user = User::query()
            ->where('active', true)
            ->whereIn('role', ['admin', 'superadmin'])
            ->whereRaw('LOWER(username) = ?', [$usernameLower])
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'username' => ['No user found with this username.'],
            ]);
        }

        $toEmail = trim((string) ($user->email ?? ''));
        if ($toEmail === '') {
            throw ValidationException::withMessages([
                'username' => ['This account has no email on file. Contact a super admin.'],
            ]);
        }

        $rateKey = self::FORGOT_OTP_RATE_PREFIX.$usernameLower.'|'.$request->ip();
        $sentCount = (int) Cache::get($rateKey, 0);
        if ($sentCount >= 5) {
            abort(429, 'Too many OTP requests. Please try again later.');
        }

        if (Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['New password must be different from your current password.'],
            ]);
        }

        $ttlMinutes = max(1, (int) env('FORGOT_PASSWORD_OTP_TTL_MINUTES', env('CHANGE_PASSWORD_OTP_TTL_MINUTES', env('ENQUIRY_OTP_TTL_MINUTES', 10))));
        $testOtp = trim((string) env('FORGOT_PASSWORD_TEST_OTP', env('CHANGE_PASSWORD_TEST_OTP', env('ENQUIRY_TEST_OTP', ''))));
        $otp = $testOtp !== '' ? $testOtp : (string) random_int(100000, 999999);
        $verificationToken = (string) Str::uuid();

        Cache::put(self::FORGOT_OTP_CACHE_PREFIX.$verificationToken, [
            'otp_hash' => Hash::make($otp),
            'attempts' => 0,
            'user_id' => $user->id,
            'password' => Crypt::encryptString($data['password']),
        ], now()->addMinutes($ttlMinutes));

        Cache::put($rateKey, $sentCount + 1, now()->addHour());

        if ($testOtp === '') {
            $fromAddress = (string) env('FORGOT_PASSWORD_OTP_FROM_ADDRESS', env('CHANGE_PASSWORD_OTP_FROM_ADDRESS', env('ENQUIRY_OTP_FROM_ADDRESS', env('MAIL_FROM_ADDRESS', '3genquiry26@gmail.com'))));
            $fromName = (string) env('FORGOT_PASSWORD_OTP_FROM_NAME', env('CHANGE_PASSWORD_OTP_FROM_NAME', env('ENQUIRY_OTP_FROM_NAME', env('MAIL_FROM_NAME', env('APP_NAME', '3G Decorative Group')))));
            $mailData = AdminAuthOtpEmail::viewData($otp, $ttlMinutes);
            $subject = AdminAuthOtpEmail::forgotPasswordSubject();

            dispatch(function () use ($toEmail, $fromAddress, $fromName, $mailData, $subject): void {
                try {
                    Mail::send('emails.forgot-password-otp', $mailData, function ($message) use ($toEmail, $fromAddress, $fromName, $subject): void {
                        $message
                            ->to($toEmail)
                            ->from($fromAddress, $fromName)
                            ->subject($subject);
                    });
                } catch (\Throwable $e) {
                    report($e);
                    logger()->error('Forgot password OTP mail failed', [
                        'to' => $toEmail,
                        'error' => $e->getMessage(),
                    ]);
                }
            })->afterResponse();
        }

        return response()->json([
            'success' => true,
            'message' => $testOtp !== ''
                ? 'Test OTP generated successfully.'
                : 'OTP sent to the email registered for this username.',
            'verification_token' => $verificationToken,
            'expires_in' => $ttlMinutes * 60,
            'email' => $toEmail,
            'test_mode' => $testOtp !== '',
        ]);
    }

    /**
     * POST /api/auth/forgot-password/otp/verify
     * Public — apply new password after OTP verification.
     */
    public function verifyForgotPasswordOtp(Request $request)
    {
        $data = $request->validate([
            'verification_token' => ['required', 'uuid'],
            'otp' => ['required', 'digits:6'],
        ]);

        $key = self::FORGOT_OTP_CACHE_PREFIX.$data['verification_token'];
        $pending = Cache::get($key);

        if (! is_array($pending)) {
            abort(410, 'OTP expired or invalid. Please request a new OTP.');
        }

        $userId = (int) ($pending['user_id'] ?? 0);
        $user = User::query()
            ->where('id', $userId)
            ->where('active', true)
            ->whereIn('role', ['admin', 'superadmin'])
            ->first();

        if (! $user) {
            Cache::forget($key);
            abort(403, 'OTP does not match this account.');
        }

        $attempts = (int) ($pending['attempts'] ?? 0);
        $ttlMinutes = max(1, (int) env('FORGOT_PASSWORD_OTP_TTL_MINUTES', env('CHANGE_PASSWORD_OTP_TTL_MINUTES', env('ENQUIRY_OTP_TTL_MINUTES', 10))));

        if ($attempts >= 5) {
            Cache::forget($key);
            abort(422, 'Too many invalid attempts. Please request a new OTP.');
        }

        if (! Hash::check($data['otp'], (string) ($pending['otp_hash'] ?? ''))) {
            $pending['attempts'] = $attempts + 1;
            Cache::put($key, $pending, now()->addMinutes($ttlMinutes));
            abort(422, 'Invalid OTP. Please try again.');
        }

        try {
            $newPassword = Crypt::decryptString((string) ($pending['password'] ?? ''));
        } catch (\Throwable) {
            Cache::forget($key);
            abort(422, 'Invalid verification payload. Please submit again.');
        }

        $user->update(['password' => $newPassword]);
        $user->tokens()->delete();
        Cache::forget($key);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully. Please sign in with your new password.',
        ]);
    }
}
