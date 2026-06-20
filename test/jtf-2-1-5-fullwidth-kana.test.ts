import { describe, it, expect } from "vitest";
import type { RulesetManifest } from "illusions-lint-sdk";

import manifest from "../manifest.json";
import { createTestContext, CONFIG } from "./test-kit";
import { createJtfFullwidthKana } from "../src/rules/jtf-2-1-5-fullwidth-kana";

const rule = () => createJtfFullwidthKana(createTestContext(), manifest as RulesetManifest);

describe("jtf-2-1-5-fullwidth-kana — detections (半角カタカナ → 全角)", () => {
  it("flags ｱ and suggests ア", () => {
    const issues = rule().lint("ｱイウエオ", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    const first = issues[0];
    expect(first.from).toBe(0);
    expect(first.to).toBe(1);
    expect(first.fix?.replacement).toBe("ア");
  });

  it("flags ﾒｰﾙｱﾄﾞﾚｽ (multi-char half-width katakana) — each char is a separate issue", () => {
    const text = "ﾒｰﾙｱﾄﾞﾚｽ";
    const issues = rule().lint(text, CONFIG);
    expect(issues.length).toBeGreaterThan(1);
    // Every fix replacement should be a single full-width katakana
    for (const issue of issues) {
      expect(issue.fix?.replacement).toBeDefined();
      expect(issue.fix!.replacement.length).toBe(1);
    }
  });

  it("flags ｯ (small tsu) and suggests ッ", () => {
    const issues = rule().lint("ｯ", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("ッ");
  });
});

describe("jtf-2-1-5-fullwidth-kana — negative (全角カタカナ・ひらがな・漢字は対象外)", () => {
  const clean = [
    "メールアドレス",   // full-width katakana — OK
    "あいうえお",       // hiragana — OK
    "漢字テキスト",     // kanji + full-width — OK
    "Hello World",      // ASCII — OK
  ];
  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-2-1-5-fullwidth-kana — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("ｱﾉﾋﾄ", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("each half-width katakana char gets its own issue", () => {
    // ｱｲ is two chars → 2 issues
    const issues = rule().lint("ｱｲ", CONFIG);
    expect(issues).toHaveLength(2);
    expect(issues[0].fix?.replacement).toBe("ア");
    expect(issues[1].fix?.replacement).toBe("イ");
  });

  it("includes JTF reference with section 2.1.5", () => {
    const issues = rule().lint("ｸ", CONFIG);
    expect(issues[0].reference?.section).toBe("2.1.5");
    expect(issues[0].reference?.standard).toContain("JTF");
  });

  it("flags ｰ (half-width prolonged sound mark) and suggests ー", () => {
    const issues = rule().lint("ｺｰﾋｰ", CONFIG);
    const replacements = issues.map((i) => i.fix?.replacement);
    expect(replacements).toContain("ー");
  });
});
