import { describe, it, expect } from "vitest";
import type { RulesetManifest } from "illusions-lint-sdk";

import manifest from "../manifest.json";
import { createTestContext, CONFIG } from "./test-kit";
import { createJtfHalfwidthAlnum } from "../src/rules/jtf-2-1-8-halfwidth-alnum";

const rule = () => createJtfHalfwidthAlnum(createTestContext(), manifest as RulesetManifest);

describe("jtf-2-1-8-halfwidth-alnum — detections (全角英数字 → 半角)", () => {
  const cases: Array<[string, string]> = [
    ["ＡＢＣ", "A"],      // full-width uppercase
    ["ａｂｃ", "a"],      // full-width lowercase
    ["１２３", "1"],      // full-width digits
    ["値はＸです。", "X"], // in context
  ];

  for (const [text, firstReplacement] of cases) {
    it(`flags full-width char in "${text}" → ${firstReplacement}`, () => {
      const issues = rule().lint(text, CONFIG);
      expect(issues.length).toBeGreaterThanOrEqual(1);
      expect(issues[0].fix?.replacement).toBe(firstReplacement);
    });
  }
});

describe("jtf-2-1-8-halfwidth-alnum — negative (半角英数字・全角記号は対象外)", () => {
  const clean = [
    "ABC",         // half-width — OK
    "abc",         // half-width — OK
    "123",         // half-width — OK
    "、。「」",    // full-width punctuation — OK (not alnum)
    "！？",        // full-width symbols — OK
  ];
  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-2-1-8-halfwidth-alnum — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("ＡＢＣ", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("produces one issue per full-width character (each char matched individually)", () => {
    const issues = rule().lint("ＡＢＣ", CONFIG);
    expect(issues).toHaveLength(3);
    expect(issues[0].fix?.replacement).toBe("A");
    expect(issues[1].fix?.replacement).toBe("B");
    expect(issues[2].fix?.replacement).toBe("C");
  });

  it("includes JTF reference with section 2.1.8", () => {
    const issues = rule().lint("Ａ", CONFIG);
    expect(issues[0].reference?.section).toBe("2.1.8");
    expect(issues[0].reference?.standard).toContain("JTF");
  });

  it("correctly maps full-width lowercase ａ→a and ｚ→z (boundary check)", () => {
    const issues = rule().lint("ａｚ", CONFIG);
    expect(issues).toHaveLength(2);
    expect(issues[0].fix?.replacement).toBe("a");
    expect(issues[1].fix?.replacement).toBe("z");
  });

  it("correctly maps full-width uppercase Ａ→A and Ｚ→Z (boundary check)", () => {
    const issues = rule().lint("ＡＺ", CONFIG);
    expect(issues).toHaveLength(2);
    expect(issues[0].fix?.replacement).toBe("A");
    expect(issues[1].fix?.replacement).toBe("Z");
  });
});
