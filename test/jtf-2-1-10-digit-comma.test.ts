import { describe, it, expect } from "vitest";
import type { RulesetManifest } from "illusions-lint-sdk";

import manifest from "../manifest.json";
import { createTestContext, CONFIG } from "./test-kit";
import { createJtfDigitComma } from "../src/rules/jtf-2-1-10-digit-comma";

const rule = () => createJtfDigitComma(createTestContext(), manifest as RulesetManifest);

describe("jtf-2-1-10-digit-comma — detections (全角区切り記号 → 半角)", () => {
  it("flags full-width comma in digit grouping 12，345 and suggests ,", () => {
    const text = "12，345";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].from).toBe(2);  // position of ，
    expect(issues[0].to).toBe(3);
    expect(issues[0].originalText).toBe("，");
    expect(issues[0].fix?.replacement).toBe(",");
  });

  it("flags full-width period in decimal 3．14 and suggests .", () => {
    const text = "3．14";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].from).toBe(1);  // position of ．
    expect(issues[0].to).toBe(2);
    expect(issues[0].originalText).toBe("．");
    expect(issues[0].fix?.replacement).toBe(".");
  });
});

describe("jtf-2-1-10-digit-comma — negative (正しい形式は対象外)", () => {
  const clean = [
    "12,345",      // half-width comma — OK
    "3.14",        // half-width period — OK
    "，",          // full-width comma not between digits — OK
    "．",          // full-width period not between digits — OK
    "abc，def",    // full-width comma between non-digits — OK
  ];
  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-2-1-10-digit-comma — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("12，345", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("flags multiple full-width commas in 1，234，567", () => {
    // 1，234，567 has two ，s between digits
    const issues = rule().lint("1，234，567", CONFIG);
    expect(issues).toHaveLength(2);
    expect(issues[0].fix?.replacement).toBe(",");
    expect(issues[1].fix?.replacement).toBe(",");
  });

  it("flags both comma and period in 12，345．67", () => {
    const issues = rule().lint("12，345．67", CONFIG);
    expect(issues).toHaveLength(2);
    const commaIssue = issues.find((i) => i.originalText === "，");
    const periodIssue = issues.find((i) => i.originalText === "．");
    expect(commaIssue?.fix?.replacement).toBe(",");
    expect(periodIssue?.fix?.replacement).toBe(".");
  });

  it("includes JTF reference with section 2.1.10", () => {
    const issues = rule().lint("12，345", CONFIG);
    expect(issues[0].reference?.section).toBe("2.1.10");
    expect(issues[0].reference?.standard).toContain("JTF");
  });
});
