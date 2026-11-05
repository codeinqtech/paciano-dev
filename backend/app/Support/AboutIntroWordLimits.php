<?php

namespace App\Support;

class AboutIntroWordLimits
{
    public static function countWords(?string $text): int
    {
        $trimmed = trim((string) $text);
        if ($trimmed === '') {
            return 0;
        }

        $parts = preg_split('/\s+/u', $trimmed, -1, PREG_SPLIT_NO_EMPTY);

        return is_array($parts) ? count($parts) : 0;
    }

    /**
     * @return array{combined_max: int, p1_max: int, p2_max: int, p1_words: int, p2_words: int, total_words: int}
     */
    public static function limits(?string $paragraph1, ?string $aboutParagraph2): array
    {
        $combinedMax = (int) config('about_content.combined_paragraph_words', 110);
        $p1Words = self::countWords($paragraph1);
        $p2Words = self::countWords($aboutParagraph2);
        $p1Max = max(20, $combinedMax - $p2Words);
        $p2Max = max(0, $combinedMax - $p1Words);

        return [
            'combined_max' => $combinedMax,
            'p1_max' => $p1Max,
            'p2_max' => $p2Max,
            'p1_words' => $p1Words,
            'p2_words' => $p2Words,
            'total_words' => $p1Words + $p2Words,
        ];
    }

    /**
     * @return array<string, string>|null
     */
    public static function validateIntro(
        ?string $paragraph1,
        ?string $aboutParagraph2,
        ?string $homeTagline,
    ): ?array {
        $errors = [];

        if (self::countWords($paragraph1) < 1) {
            $errors['paragraph_1'] = 'The first paragraph is required.';
        }

        $limits = self::limits($paragraph1, $aboutParagraph2);
        if ($limits['total_words'] > $limits['combined_max']) {
            $errors['paragraph_1'] = 'Combined paragraph word limit exceeded.';
            $errors['paragraph_2'] = 'Combined paragraph word limit exceeded.';
        }

        if (self::countWords($paragraph1) > $limits['p1_max']) {
            $errors['paragraph_1'] = "First paragraph allows at most {$limits['p1_max']} words with the current second paragraph.";
        }

        if (self::countWords($aboutParagraph2) > $limits['p2_max']) {
            $errors['paragraph_2'] = "Second paragraph allows at most {$limits['p2_max']} words with the current first paragraph.";
        }

        $taglineMax = (int) config('about_content.home_tagline_max_words', 40);
        if (self::countWords($homeTagline) > $taglineMax) {
            $errors['home_tagline'] = "Home tagline allows at most {$taglineMax} words.";
        }

        return $errors === [] ? null : $errors;
    }
}
