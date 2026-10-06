<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Change password</title>
</head>
<body style="font-family: sans-serif; color: #102619;">
    <p>Your one-time password for changing your {{ $appName }} admin password:</p>
    <p style="font-size: 24px; letter-spacing: 4px; font-weight: bold;">{{ $otp }}</p>
    <p>This code expires in {{ $ttlMinutes }} minutes.</p>
</body>
</html>
