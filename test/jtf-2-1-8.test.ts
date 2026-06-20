import { describe, it, expect } from "vitest";
import type { RulesetManifest } from "illusions-lint-sdk";

import manifest from "../manifest.json";
import { createTestContext, CONFIG } from "./test-kit";
import { createJtfNumericStandard } from "../src/rules/jtf-2-1-8";

const rule = () => createJtfNumericStandard(createTestContext(), manifest as RulesetManifest);

describe("jtf-2-1-8 — detections (全角数字 → 半角)", () => {
  const cases: Array<[string, string, number]> = [
    ["ファイルサイズは２５６MBです。", "2", 8],
    ["値は０です。", "0", 2],
    ["距離は１０ kmです。", "1", 3],
  ];

  for (const [text, firstReplacement, firstFrom] of cases) {
    it(`flags full-width digit in "${text}"`, () => {
      const issues = rule().lint(text, CONFIG);
      expect(issues.length).toBeGreaterThanOrEqual(1);
      expect(issues[0].from).toBe(firstFrom);
      expect(issues[0].fix?.replacement).toBe(firstReplacement);
    });
  }
});

describe("jtf-2-1-8 — negative (半角数字・全角英字は対象外)", () => {
  const clean = [
    "ファイルサイズは256MBです。",   // half-width digits — OK
    "全角英字ＡＢＣは別ルール対象",   // full-width alpha NOT in this rule's range
    "普通のテキストです。",
  ];
  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-2-1-8 — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("値は２です。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("produces one issue per full-width digit (not grouped)", () => {
    // ２５６ → 3 separate issues (rule matches one char at a time)
    const issues = rule().lint("２５６", CONFIG);
    expect(issues).toHaveLength(3);
    expect(issues[0].fix?.replacement).toBe("2");
    expect(issues[1].fix?.replacement).toBe("5");
    expect(issues[2].fix?.replacement).toBe("6");
  });

  it("includes JTF reference with section 2.1.8", () => {
    const issues = rule().lint("値は１です。", CONFIG);
    expect(issues[0].reference?.section).toBe("2.1.8");
    expect(issues[0].reference?.standard).toContain("JTF");
  });

  it("does not flag full-width alpha (Ａ-Ｚ ａ-ｚ) — those are handled by halfwidth-alnum rule", () => {
    const issues = rule().lint("ＡＢＣ", CONFIG);
    expect(issues).toHaveLength(0);
  });
});
