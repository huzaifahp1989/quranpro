// Arabic text normalization utilities
// - Strip diacritics, tatweel, punctuation
// - Normalize Arabic letter variants
// - Tokenize to words

const DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06EA-\u06ED]/g; // Harakat & Quran marks
const TATWEEL_REGEX = /\u0640/g; // Tatweel
const PUNCT_REGEX = /[\u060C\u061B\u061F\u066A-\u066D.,;!?"'\-–—()\[\]{}]/g;

// Map common Arabic letter variants to a base form
const ARABIC_NORM_MAP: Record<string, string> = {
  "أ": "ا",
  "إ": "ا",
  "ٱ": "ا",
  "آ": "ا",
  "ى": "ي",
  "ئ": "ي",
  "ؤ": "و",
};

export function normalizeArabic(input: string): string {
  let s = input || "";
  s = s.replace(DIACRITICS_REGEX, "");
  s = s.replace(TATWEEL_REGEX, "");
  s = s.replace(PUNCT_REGEX, " ");
  // Normalize letter variants
  s = s.replace(/[أإٱآىئؤ]/g, (ch) => ARABIC_NORM_MAP[ch] || ch);
  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export function tokenizeWords(input: string): string[] {
  const s = normalizeArabic(input);
  if (!s) return [];
  return s.split(" ").filter(Boolean);
}

// Simple Levenshtein distance for strings
export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export function jaccard(wordsA: string[], wordsB: string[]): number {
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export type DiffToken = { word: string; ok: boolean };

export function diffWords(ref: string[], hyp: string[]): DiffToken[] {
  const maxLen = Math.max(ref.length, hyp.length);
  const out: DiffToken[] = [];
  for (let i = 0; i < maxLen; i++) {
    const r = ref[i];
    const h = hyp[i];
    if (r === undefined) continue; // ignore extra hyp words for now
    if (h === undefined) {
      out.push({ word: r, ok: false });
      continue;
    }
    if (r === h) {
      out.push({ word: r, ok: true });
    } else {
      // Allow small edit distance as OK threshold
      const dist = levenshtein(r, h);
      const ok = dist <= 1; // tolerant by 1 edit
      out.push({ word: r, ok });
    }
  }
  return out;
}

export function accuracyFromDiff(diff: DiffToken[]): number {
  if (!diff.length) return 0;
  const ok = diff.filter(d => d.ok).length;
  return Math.round((ok / diff.length) * 100);
}

