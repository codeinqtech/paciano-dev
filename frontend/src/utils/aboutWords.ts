export function countWords(text: string | null | undefined): number {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function truncateWords(
  text: string | null | undefined,
  maxWords: number,
): { text: string; truncated: boolean } {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return { text: "", truncated: false };
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return { text: trimmed, truncated: false };
  }
  return { text: `${words.slice(0, maxWords).join(" ")}…`, truncated: true };
}
