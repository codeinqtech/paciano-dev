<?php

namespace App\Http\Controllers;

use App\Services\GoogleBusinessOAuthService;
use Illuminate\Http\Request;

class GoogleReviewAuthController extends Controller
{
    public function callback(Request $request, GoogleBusinessOAuthService $oauth)
    {
        if ($request->filled('error')) {
            return $this->redirectToAdmin(false, 'Google authorization was cancelled.');
        }

        $state = (string) $request->input('state', '');
        $code = (string) $request->input('code', '');

        if ($state === '' || $code === '') {
            return $this->redirectToAdmin(false, 'Missing OAuth parameters.');
        }

        $result = $oauth->handleCallback($code, $state);

        return $this->redirectToAdmin($result['success'], $result['message']);
    }

    private function redirectToAdmin(bool $success, string $message)
    {
        $frontend = rtrim((string) env('FRONTEND_URL', 'http://127.0.0.1:8443'), '/');
        $query = http_build_query([
            'google_oauth' => $success ? 'success' : 'error',
            'google_oauth_message' => $message,
        ]);

        return redirect($frontend.'/admin/google-reviews?'.$query);
    }
}