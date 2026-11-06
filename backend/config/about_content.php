<?php

return [
    /** Combined word budget for about intro paragraphs (p1 + optional about p2). */
    'combined_paragraph_words' => (int) env('ABOUT_COMBINED_PARAGRAPH_WORDS', 110),

    /** Home-only tagline under paragraph 1. */
    'home_tagline_max_words' => (int) env('ABOUT_HOME_TAGLINE_MAX_WORDS', 40),

    /** On home, show “View more” when paragraph 1 exceeds this many words. */
    'home_teaser_words' => (int) env('ABOUT_HOME_TEASER_WORDS', 42),
];
