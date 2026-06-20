import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfPunctuationStandard } from "../src/rules/jtf-1-2-1";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfPunctuationStandard(createTestContext(), manifest);

describe("jtf-1-2-1 — 全角カンマ（，）の検出", () => {
  it("flags full-width comma ，and suggests 、", () => {
    const issues = rule().lint("これは，見本となる例です。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].from).toBe(3);
    expect(issues[0].to).toBe(4);
    expect(issues[0].fix?.replacement).toBe("、");
    expect(issues[0].originalText).toBe("，");
  });

  it("flags multiple full-width commas", () => {
    const issues = rule().lint("A，B，C", CONFIG);
    expect(issues).toHaveLength(2);
    expect(issues[0].fix?.replacement).toBe("、");
    expect(issues[1].fix?.replacement).toBe("、");
  });
});

describe("jtf-1-2-1 — 全角ピリオド（．）の検出", () => {
  it("flags full-width period ．and suggests 。", () => {
    const issues = rule().lint("これは見本となる例です．", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("。");
    expect(issues[0].originalText).toBe("．");
  });

  it("flags mixed full-width comma and period", () => {
    const issues = rule().lint("これは，見本です．", CONFIG);
    expect(issues).toHaveLength(2);
    expect(issues[0].fix?.replacement).toBe("、");
    expect(issues[1].fix?.replacement).toBe("。");
  });
});

describe("jtf-1-2-1 — 正しい句読点は flagしない", () => {
  const clean = [
    "これは、見本となる例です。",
    "A, B, C",           // half-width comma in ASCII context
    "price: $3.14",      // half-width period in ASCII context
    "特に問題ありません。",
  ];
  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-1-2-1 — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("これは，例です．", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("reference section is 1.2.1", () => {
    const issues = rule().lint("これは，例です。", CONFIG);
    expect(issues[0].reference?.section).toBe("1.2.1");
  });

  it("messageJa contains 全角カンマ for comma issue", () => {
    const issues = rule().lint("，", CONFIG);
    expect(issues[0].messageJa).toContain("全角カンマ");
  });

  it("messageJa contains 全角ピリオド for period issue", () => {
    const issues = rule().lint("．", CONFIG);
    expect(issues[0].messageJa).toContain("全角ピリオド");
  });
});
