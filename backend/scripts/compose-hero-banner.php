<?php

/** One-off: stitch DJI frames into a wide hero background. */

$inputs = [
    'C:/Users/USER/.cursor/projects/c-laragon-www-PACIANO-DEV/assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_9a2bb3e2750dd41c8e5d7822fd6d5266_images_DJI_20260930134220_0027_D-4308c195-af01-44ba-9eaa-33e29ef0bcc8.png',
    'C:/Users/USER/.cursor/projects/c-laragon-www-PACIANO-DEV/assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_9a2bb3e2750dd41c8e5d7822fd6d5266_images_DJI_20260930153149_0035_D-c43a594c-e5b0-4201-ab96-e9df17ccc5c2.png',
    'C:/Users/USER/.cursor/projects/c-laragon-www-PACIANO-DEV/assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_9a2bb3e2750dd41c8e5d7822fd6d5266_images_DJI_20260930153245_0038_D-672bec47-306b-418b-9c76-a54871305512.png',
];

$out = dirname(__DIR__, 2).'/frontend/src/images/hero-dji-panorama.jpg';
$targetHeight = 1440;

$scaled = [];
$totalWidth = 0;

foreach ($inputs as $path) {
    if (! is_file($path)) {
        fwrite(STDERR, "Missing: {$path}\n");
        exit(1);
    }

    $src = imagecreatefrompng($path);
    if ($src === false) {
        fwrite(STDERR, "Could not load: {$path}\n");
        exit(1);
    }

    $w = imagesx($src);
    $h = imagesy($src);
    $newW = (int) round($targetHeight * ($w / $h));
    $dst = imagecreatetruecolor($newW, $targetHeight);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $targetHeight, $w, $h);
    imagedestroy($src);

    $scaled[] = $dst;
    $totalWidth += $newW;
}

$canvas = imagecreatetruecolor($totalWidth, $targetHeight);
$x = 0;
foreach ($scaled as $img) {
    $pw = imagesx($img);
    imagecopy($canvas, $img, $x, 0, 0, 0, $pw, $targetHeight);
    $x += $pw;
    imagedestroy($img);
}

if (! imagejpeg($canvas, $out, 92)) {
    fwrite(STDERR, "Failed to write {$out}\n");
    exit(1);
}

imagedestroy($canvas);

echo "Wrote {$out} ({$totalWidth}x{$targetHeight})\n";
