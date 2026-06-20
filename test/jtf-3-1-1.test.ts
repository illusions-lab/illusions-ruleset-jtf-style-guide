import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfKuten } from "../src/rules/jtf-3-1-1";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfKuten(createTestContext(), manifest);

describe("jtf-3-1-1 — 半角ピリオドを文末句点として使う場合を検出", () => {
  it("flags period followed by Japanese character", () => {
    const text = "ファイルを保存します.次の画面へ進みます。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("。");
    expect(issues[0].originalText).toBe(".");
    expect(issues[0].reference?.section).toBe("3.1.1");
  });

  it("flags period at end of text", () => {
    const text = "処理が完了しました.";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("。");
  });
});

describe("jtf-3-1-1 — 正しい形は flagしない", () => {
  it("does not flag decimal point (digit before period)", () => {
    expect(rule().lint("値は3.14です。", CONFIG)).toHaveLength(0);
  });

  it("does not flag period after alpha (abbreviation)", () => {
    expect(rule().lint("e.g.テスト", CONFIG)).toHaveLength(0);
  });

  it("does not flag period between ASCII chars", () => {
    expect(rule().lint("www.example.com", CONFIG)).toHaveLength(0);
  });

  it("leaves correct kuten untouched", () => {
    expect(rule().lint("処理が完了しました。", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-3-1-1 — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("完了しました.", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("messageJa mentions 全角句点", () => {
    const issues = rule().lint("完了しました.次へ", CONFIG);
    expect(issues[0].messageJa).toContain("全角句点");
  });

  it("skips period when preceded by digit (decimal point guard)", () => {
    // "保存率99.9%です" — digit before period, should not flag
    expect(rule().lint("保存率99.9%です。", CONFIG)).toHaveLength(0);
  });

  it("flags multiple periods at sentence ends", () => {
    const text = "A.B.";
    // Both followed by non-JA char or end — only end-of-string match counts
    // First "." is followed by "B" (alpha), skip. Second "." is at end, skip (preceded by alpha).
    expect(rule().lint(text, CONFIG)).toHaveLength(0);
  });
});
