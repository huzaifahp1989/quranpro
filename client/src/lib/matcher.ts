import { normalizeArabic, tokenizeWords, diffWords, accuracyFromDiff, DiffToken } from "./normalize";

export type MatchResult = {
  jaccard: number;
  accuracy: number;
  diff: DiffToken[];
  refTokens: string[];
  hypTokens: string[];
};

export function matchAyahText(referenceArabic: string, hypothesisArabic: string): MatchResult {
  const refTokens = tokenizeWords(referenceArabic);
  const hypTokens = tokenizeWords(hypothesisArabic);
  const jac = jaccard(refTokens, hypTokens);
  const diff = diffWords(refTokens, hypTokens);
  const acc = accuracyFromDiff(diff);
  return { jaccard: jac, accuracy: acc, diff, refTokens, hypTokens };
}

// Helper to reconstruct highlighted HTML spans
export function renderHighlightedWords(result: MatchResult): { word: string; ok: boolean }[] {
  return result.diff.map(d => ({ word: d.word, ok: d.ok }));
}

