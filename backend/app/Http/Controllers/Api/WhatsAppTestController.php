<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;

class WhatsAppTestController extends Controller
{
    public function send(Request $request, WhatsAppService $whatsapp)
    {
        $message = $request->input(
            'message',
            'Paciano WhatsApp API test successful!'
        );

        try {
            $result = $whatsapp->send($message);

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp message accepted.',
                'sid' => $result['sid'] ?? null,
                'status' => $result['status'] ?? null,
            ]);

        } catch (\Throwable $e) {
            logger()->error('WhatsApp test failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'WhatsApp notification failed.',
            ], 502);
        }
    }
}
