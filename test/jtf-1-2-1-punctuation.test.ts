import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfPunctuationReplacement } from "../src/rules/jtf-1-2-1-punctuation";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfPunctuationReplacement(createTestContext(), manifest);

describe("jtf-1-2-1-punctuation — 半角カンマの検出（和文隣接）", () => {
  it("flags comma after Japanese character", () => {
    const text = "これは,見本です。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("、");
    expect(issues[0].originalText).toBe(",");
    expect(issues[0].reference?.section).toBe("1.2.1");
  });

  it("flags comma before Japanese character", () => {
    const text = "OK,これはテストです。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("、");
  });
});

describe("jtf-1-2-1-punctuation — 半角ピリオドの検出（和文隣接）", () => {
  it("flags period after Japanese character (non-decimal)", () => {
    const text = "ファイルを保存します.次に進みます。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("。");
    expect(issues[0].originalText).toBe(".");
  });

  it("flags period before Japanese character", () => {
    const text = ".これはテストです。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("。");
  });
});

describe("jtf-1-2-1-punctuation — 正しい形は flagしない", () => {
  it("does not flag comma between ASCII characters", () => {
    expect(rule().lint("a,b,c", CONFIG)).toHaveLength(0);
  });

  it("does not flag decimal point (digit.digit)", () => {
    expect(rule().lint("値は3.14です。", CONFIG)).toHaveLength(0);
  });

  it("does not flag period after alpha abbreviation before Japanese", () => {
    // "e.g.これ" — preceded by alpha, so excluded
    expect(rule().lint("e.g.これはテストです。", CONFIG)).toHaveLength(0);
  });

  it("leaves clean Japanese text untouched", () => {
    expect(rule().lint("これは、見本となる例です。", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-1-2-1-punctuation — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("これは,例です。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("messageJa mentions 半角カンマ for comma issue", () => {
    const issues = rule().lint("これは,例です。", CONFIG);
    expect(issues[0].messageJa).toContain("半角カンマ");
  });

  it("messageJa mentions 半角ピリオド for period issue", () => {
    const issues = rule().lint("ファイルを保存します.次へ", CONFIG);
    expect(issues[0].messageJa).toContain("半角ピリオド");
  });

  it("flags both comma and period in same text", () => {
    const text = "これは,見本です.終わり";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(2);
  });
});
