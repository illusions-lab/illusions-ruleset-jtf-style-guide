import { describe, it, expect } from "vitest";
import type { RulesetManifest } from "illusions-lint-sdk";

import manifest from "../manifest.json";
import { createTestContext, CONFIG } from "./test-kit";
import { createJtfKanji } from "../src/rules/jtf-2-2-1-kanji";

const rule = () => createJtfKanji(createTestContext(), manifest as RulesetManifest);

describe("jtf-2-2-1-kanji — detections (ひらがな → 漢字表記)", () => {
  const cases: Array<[string, string, string, number, number]> = [
    ["かならず確認してください。", "かならず", "必ず", 0, 4],
    ["いっさい関係ありません。",  "いっさい", "一切", 0, 4],
    ["すでに完了しました。",      "すでに",   "既に", 0, 3],
    ["すべての項目を確認する。",  "すべて",   "全て", 0, 3],
    ["もっとも重要な点は。",      "もっとも", "最も", 0, 4],
  ];

  for (const [text, hiragana, kanji, from, to] of cases) {
    it(`flags "${hiragana}" in "${text}" and suggests "${kanji}"`, () => {
      const issues = rule().lint(text, CONFIG);
      const hit = issues.find((i) => i.originalText === hiragana);
      expect(hit).toBeDefined();
      expect(hit!.from).toBe(from);
      expect(hit!.to).toBe(to);
      expect(hit!.fix?.replacement).toBe(kanji);
    });
  }
});

describe("jtf-2-2-1-kanji — negative (正しい漢字表記は対象外)", () => {
  const clean = [
    "必ず確認してください。",
    "一切関係ありません。",
    "既に完了しました。",
    "全ての項目を確認する。",
    "最も重要な点は。",
    "直ちに対応します。",
    "常に注意が必要です。",
  ];
  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-2-2-1-kanji — false-positive guards (KANJI_EXCLUSION_PATTERNS)", () => {
  it("does NOT flag もっとも in もっともらしい (exclusion pattern: /もっともらし/)", () => {
    const issues = rule().lint("もっともらしい説明だった。", CONFIG);
    const hit = issues.find((i) => i.originalText === "もっとも");
    expect(hit).toBeUndefined();
  });

  it("does NOT flag すべて in すべからく (exclusion pattern: /すべからく/)", () => {
    const issues = rule().lint("学生はすべからく勉強すべきだ。", CONFIG);
    const hit = issues.find((i) => i.originalText === "すべて");
    expect(hit).toBeUndefined();
  });

  it("flags もっとも in a normal sentence (no compound suffix)", () => {
    const issues = rule().lint("これがもっとも重要です。", CONFIG);
    const hit = issues.find((i) => i.originalText === "もっとも");
    expect(hit).toBeDefined();
    expect(hit!.fix?.replacement).toBe("最も");
  });

  it("flags すべて in a normal sentence (no compound suffix)", () => {
    const issues = rule().lint("すべての人に適用される。", CONFIG);
    const hit = issues.find((i) => i.originalText === "すべて");
    expect(hit).toBeDefined();
    expect(hit!.fix?.replacement).toBe("全て");
  });
});

describe("jtf-2-2-1-kanji — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("かならず確認する。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("flags multiple different hiragana words in one sentence", () => {
    const text = "かならずすでに確認してください。";
    const issues = rule().lint(text, CONFIG);
    const hiraganaTexts = issues.map((i) => i.originalText);
    expect(hiraganaTexts).toContain("かならず");
    expect(hiraganaTexts).toContain("すでに");
  });

  it("includes JTF reference with section 2.2.1", () => {
    const issues = rule().lint("わずかな差があります。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues[0].reference?.section).toBe("2.2.1");
    expect(issues[0].reference?.standard).toContain("JTF");
  });

  it("reports correct from/to span for multi-char hiragana word", () => {
    // "ふたたび" is 4 chars, starts at index 5 in "これがふたたびあります。"
    const text = "これがふたたびあります。";
    const issues = rule().lint(text, CONFIG);
    const hit = issues.find((i) => i.originalText === "ふたたび");
    expect(hit).toBeDefined();
    expect(hit!.to - hit!.from).toBe(4);
    expect(hit!.fix?.replacement).toBe("再び");
  });
});
