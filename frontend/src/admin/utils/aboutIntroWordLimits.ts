const COMBINED_MAX = 110;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).filter(Boolean).length;
}

export function computeIntroWordLimits(paragraph1: string, paragraph2: string) {
  const p1Words = countWords(paragraph1);
  const p2Words = countWords(paragraph2);
  const p1Max = Math.max(20, COMBINED_MAX - p2Words);
  const p2Max = Math.max(0, COMBINED_MAX - p1Words);
  return {
    combined_max: COMBINED_MAX,
    p1_words: p1Words,
    p2_words: p2Words,
    p1_max: p1Max,
    p2_max: p2Max,
    total_words: p1Words + p2Words,
  };
}
