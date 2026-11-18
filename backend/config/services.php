<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'twilio' => [
        'account_sid' => env('TWILIO_ACCOUNT_SID'),
        'auth_token' => env('TWILIO_AUTH_TOKEN'),
        'whatsapp_from' => env('TWILIO_WHATSAPP_FROM'),
        'whatsapp_to' => env('TWILIO_WHATSAPP_TO'),
        'content_sid' => env('TWILIO_WHATSAPP_CONTENT_SID'),
    ],

    'meta_whatsapp' => [
        'api_version' => env('META_WHATSAPP_API_VERSION', 'v25.0'),
        'phone_number_id' => env('META_WHATSAPP_PHONE_NUMBER_ID'),
        'business_account_id' => env('META_WHATSAPP_BUSINESS_ACCOUNT_ID'),
        'access_token' => env('META_WHATSAPP_ACCESS_TOKEN'),
        'recipient' => env('META_WHATSAPP_RECIPIENT'),
        'template_name' => env('META_WHATSAPP_TEMPLATE_NAME'),
        'template_language' => env('META_WHATSAPP_TEMPLATE_LANGUAGE', 'en'),
    ],

    'google_business' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
        'account_id' => env('GOOGLE_BUSINESS_ACCOUNT_ID'),
        'location_id' => env('GOOGLE_BUSINESS_LOCATION_ID'),
        'scope' => env(
            'GOOGLE_BUSINESS_REVIEW_SCOPE',
            'https://www.googleapis.com/auth/business.manage',
        ),
        'reviews_api_url' => env(
            'GOOGLE_REVIEWS_API_URL',
            'https://mybusiness.googleapis.com/v4',
        ),
        'place_id' => env('GOOGLE_PLACE_ID', 'ChIJ835SmFAR5DkRmylIBPB9QX4'),
        // Optional: one-time refresh token from OAuth (Postman / Connect flow) for servers
        'refresh_token' => env('GOOGLE_REFRESH_TOKEN'),
        'max_sync_pages' => (int) env('GOOGLE_BUSINESS_MAX_SYNC_PAGES', 120),
    ],
];
