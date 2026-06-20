/**
 * Shared helpers for JTF 日本語標準スタイルガイド rules.
 *
 * Ported verbatim from the original built-in implementation so detection
 * behaviour is identical. These are pure data/utilities; the SDK base classes
 * and toolkit are still injected via `ctx` in each rule module.
 */
import type { LintReference } from "illusions-lint-sdk";

/** Japanese full-width character class pattern (for lookaround etc.) */
export const JA_CHAR = "[\\u3041-\\u3096\\u30A1-\\u30F6\\u4E00-\\u9FFF\\u3400-\\u4DBF]";

/** Shared reference for every JTF rule. */
export function jtfRef(section: string): LintReference {
  return {
    standard: "JTF日本語標準スタイルガイド",
    section,
    url: "https://www.jtf.jp/tips/styleguide",
  };
}

// ---------------------------------------------------------------------------
// Half-width katakana → full-width conversion map
// ---------------------------------------------------------------------------
export const HALF_TO_FULL_KANA: ReadonlyMap<string, string> = new Map([
  ["ｦ", "ヲ"],
  ["ｧ", "ァ"],
  ["ｨ", "ィ"],
  ["ｩ", "ゥ"],
  ["ｪ", "ェ"],
  ["ｫ", "ォ"],
  ["ｬ", "ャ"],
  ["ｭ", "ュ"],
  ["ｮ", "ョ"],
  ["ｯ", "ッ"],
  ["ｰ", "ー"],
  ["ｱ", "ア"],
  ["ｲ", "イ"],
  ["ｳ", "ウ"],
  ["ｴ", "エ"],
  ["ｵ", "オ"],
  ["ｶ", "カ"],
  ["ｷ", "キ"],
  ["ｸ", "ク"],
  ["ｹ", "ケ"],
  ["ｺ", "コ"],
  ["ｻ", "サ"],
  ["ｼ", "シ"],
  ["ｽ", "ス"],
  ["ｾ", "セ"],
  ["ｿ", "ソ"],
  ["ﾀ", "タ"],
  ["ﾁ", "チ"],
  ["ﾂ", "ツ"],
  ["ﾃ", "テ"],
  ["ﾄ", "ト"],
  ["ﾅ", "ナ"],
  ["ﾆ", "ニ"],
  ["ﾇ", "ヌ"],
  ["ﾈ", "ネ"],
  ["ﾉ", "ノ"],
  ["ﾊ", "ハ"],
  ["ﾋ", "ヒ"],
  ["ﾌ", "フ"],
  ["ﾍ", "ヘ"],
  ["ﾎ", "ホ"],
  ["ﾏ", "マ"],
  ["ﾐ", "ミ"],
  ["ﾑ", "ム"],
  ["ﾒ", "メ"],
  ["ﾓ", "モ"],
  ["ﾔ", "ヤ"],
  ["ﾕ", "ユ"],
  ["ﾖ", "ヨ"],
  ["ﾗ", "ラ"],
  ["ﾘ", "リ"],
  ["ﾙ", "ル"],
  ["ﾚ", "レ"],
  ["ﾛ", "ロ"],
  ["ﾜ", "ワ"],
  ["ﾝ", "ン"],
  ["ﾞ", "゛"],
  ["ﾟ", "゜"],
]);

// ---------------------------------------------------------------------------
// Full-width alphanumeric → half-width conversion
// ---------------------------------------------------------------------------
export function fullwidthToHalfwidth(ch: string): string {
  const code = ch.charCodeAt(0);
  // ０-９ (0xFF10-0xFF19) → 0-9
  if (code >= 0xff10 && code <= 0xff19) return String.fromCharCode(code - 0xff10 + 0x30);
  // Ａ-Ｚ (0xFF21-0xFF3A) → A-Z
  if (code >= 0xff21 && code <= 0xff3a) return String.fromCharCode(code - 0xff21 + 0x41);
  // ａ-ｚ (0xFF41-0xFF5A) → a-z
  if (code >= 0xff41 && code <= 0xff5a) return String.fromCharCode(code - 0xff41 + 0x61);
  return ch;
}

// ---------------------------------------------------------------------------
// Half-width bracket → full-width conversion map
// ---------------------------------------------------------------------------
export const HALF_TO_FULL_BRACKET: ReadonlyMap<string, string> = new Map([
  ["(", "（"],
  [")", "）"],
  ["[", "［"],
  ["]", "］"],
  ["｢", "「"],
  ["｣", "」"],
]);

// ---------------------------------------------------------------------------
// Kanji conversion target list for jtf-2-2-1-kanji
// ---------------------------------------------------------------------------
export const HIRAGANA_TO_KANJI: ReadonlyArray<[string, string]> = [
  ["いっさい", "一切"],
  ["かならず", "必ず"],
  ["おおいに", "大いに"],
  ["しいて", "強いて"],
  ["すでに", "既に"],
  ["すべて", "全て"],
  ["ただちに", "直ちに"],
  ["つねに", "常に"],
  ["はなはだ", "甚だ"],
  ["ふたたび", "再び"],
  ["まったく", "全く"],
  ["もっとも", "最も"],
  ["もっぱら", "専ら"],
  ["わずか", "僅か"],
];

/**
 * Known compound words that start with a HIRAGANA_TO_KANJI entry but form a
 * different word. Used to suppress false positives in substring matching.
 */
export const KANJI_EXCLUSION_PATTERNS: ReadonlyMap<string, RegExp> = new Map([
  ["もっとも", /もっともらし/],
  ["すべて", /すべからく/],
]);
