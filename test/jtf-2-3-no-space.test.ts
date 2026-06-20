import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfNoSpace } from "../src/rules/jtf-2-3-no-space";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfNoSpace(createTestContext(), manifest);

describe("jtf-2-3-no-space — 半角→全角方向の検出", () => {
  it("flags space between half-width letter and Japanese character", () => {
    const text = "JTF 標準";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].from).toBe(3);
    expect(issues[0].to).toBe(4);
    expect(issues[0].fix?.replacement).toBe("");
    expect(issues[0].originalText).toBe(" ");
    expect(issues[0].reference?.section).toBe("2.3");
  });

  it("flags space between half-width digit and Japanese character", () => {
    const text = "第2 章";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].from).toBe(2);
    expect(issues[0].to).toBe(3);
    expect(issues[0].fix?.replacement).toBe("");
  });
});

describe("jtf-2-3-no-space — 全角→半角方向の検出", () => {
  it("flags space between Japanese character and half-width letter", () => {
    const text = "バージョン A";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].from).toBe(5); // position of space (after last kana char, 5 chars in)
    expect(issues[0].to).toBe(6);
    expect(issues[0].fix?.replacement).toBe("");
  });

  it("flags space between Japanese character and half-width digit", () => {
    const text = "テスト 2";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("");
    expect(issues[0].originalText).toBe(" ");
  });

  it("messageJa mentions 全角文字と半角文字 for full-to-half direction", () => {
    const issues = rule().lint("テスト 2", CONFIG);
    expect(issues[0].messageJa).toContain("全角文字と半角文字");
  });
});

describe("jtf-2-3-no-space — 正しい形は flagしない（false positives）", () => {
  it("does not flag text with no spaces", () => {
    expect(rule().lint("JTF標準", CONFIG)).toHaveLength(0);
  });

  it("does not flag space between two Japanese characters", () => {
    expect(rule().lint("テスト 確認", CONFIG)).toHaveLength(0);
  });

  it("does not flag space between two half-width characters", () => {
    expect(rule().lint("abc def", CONFIG)).toHaveLength(0);
  });

  it("does not flag full-width space (U+3000) — rule targets ASCII space only", () => {
    // The rule pattern is a literal space " " not a character class including U+3000
    expect(rule().lint("JTF　標準", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-2-3-no-space — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("JTF 標準", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("flags multiple spaces in the same string as separate issues", () => {
    const text = "JTF 標準 v2 テスト";
    // "JTF 標準" → half-to-full; "v2 テスト" → half-to-full; "標準 v2" → full-to-half
    // "標準 v2": 全角→半角 (space at index 6)
    // "v2 テスト": 半角→全角 (space at index 8)
    const issues = rule().lint(text, CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(2);
    for (const issue of issues) {
      expect(issue.fix?.replacement).toBe("");
    }
  });

  it("from/to spans exactly the space character (1 char width)", () => {
    const issues = rule().lint("JTF 標準", CONFIG);
    expect(issues[0].to - issues[0].from).toBe(1);
  });

  it("reference standard contains JTF", () => {
    const issues = rule().lint("JTF 標準", CONFIG);
    expect(issues[0].reference?.standard).toContain("JTF");
  });
});
