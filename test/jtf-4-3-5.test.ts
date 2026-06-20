import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfElectricalUnit } from "../src/rules/jtf-4-3-5";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfElectricalUnit(createTestContext(), manifest);

describe("jtf-4-3-5 — 電気単位の大小誤りを検出", () => {
  // single-match cases
  const singleCases: Array<[string, string]> = [
    ["電圧100vです。", "V"],
    ["消費電力60wです。", "W"],
    ["電流5aです。", "A"],
    ["出力3kwです。", "kW"],
    ["出力50mwです。", "mW"],
    ["電圧100mvです。", "mV"],
    ["電流5maです。", "mA"],
  ];

  for (const [text, correct] of singleCases) {
    it(`flags "${text}" → ${correct}`, () => {
      const issues = rule().lint(text, CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe(correct);
      expect(issues[0].reference?.section).toBe("4.3.5");
    });
  }

  it("flags KW → kW (may match both /kw/gi and /KW/g, all replacements are kW)", () => {
    // /kw\b/gi is case-insensitive and matches KW; /KW\b/g also matches KW.
    // Both patterns target the same span with the same replacement "kW".
    const issues = rule().lint("出力3KWです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.every((i) => i.fix?.replacement === "kW")).toBe(true);
    expect(issues[0].reference?.section).toBe("4.3.5");
  });
});

describe("jtf-4-3-5 — kw は case-insensitive で kW に修正", () => {
  it("flags kw (lowercase) → kW", () => {
    const issues = rule().lint("出力3kwです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("kW");
  });

  it("flags KW (all caps) → kW (both /kw/gi and /KW/g match; all replacements are kW)", () => {
    const issues = rule().lint("出力3KWです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.every((i) => i.fix?.replacement === "kW")).toBe(true);
  });
});

describe("jtf-4-3-5 — 正しい表記は flag しない", () => {
  const clean = [
    "電圧100Vです。",
    "消費電力60Wです。",
    "電流5Aです。",
    "出力3kWです。",
    "電圧100mVです。",
    "電流5mAです。",
  ];
  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-4-3-5 — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("電圧100vです。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("messageJa contains the matched unit and correct unit", () => {
    const issues = rule().lint("電圧100vです。", CONFIG);
    expect(issues[0].messageJa).toContain("v");
    expect(issues[0].messageJa).toContain("V");
  });

  it("does not flag v when followed by letters (e.g. 'volt' word)", () => {
    // lookahead [^a-zA-Z] prevents flagging 'volt' as a unit
    expect(rule().lint("100voltage。", CONFIG)).toHaveLength(0);
  });

  it("flags multiple wrong-case electrical units in one sentence", () => {
    const issues = rule().lint("電圧100v、電力60wです。", CONFIG);
    expect(issues).toHaveLength(2);
    const replacements = issues.map((i) => i.fix?.replacement);
    expect(replacements).toContain("V");
    expect(replacements).toContain("W");
  });

  it("MW (megawatt, all caps) produces no issue — it is already correct", () => {
    // Source has MW→MW which is a no-op; the rule skips m[0] === correct
    expect(rule().lint("出力5MWです。", CONFIG)).toHaveLength(0);
  });
});
