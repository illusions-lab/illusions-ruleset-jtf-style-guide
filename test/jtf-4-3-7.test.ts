import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfFrequencyUnit } from "../src/rules/jtf-4-3-7";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfFrequencyUnit(createTestContext(), manifest);

describe("jtf-4-3-7 — 周波数の単位（SI）— 検出（単一パターンに一致するケース）", () => {
  // These inputs match exactly one pattern (no overlap between patterns).
  const singleMatchCases: Array<[string, string]> = [
    ["周波数は50hzです。", "Hz"],     // matches /hz\b/ only
    ["周波数は50HZです。", "Hz"],     // matches /HZ\b/ only
    ["帯域は5mhzです。", "MHz"],      // matches /mhz\b/ only
    ["帯域は5MHZです。", "MHz"],      // matches /MHZ\b/ only
    ["Wi-Fiは2.4ghzです。", "GHz"],   // matches /ghz\b/ only
    ["Wi-Fiは2.4GHZです。", "GHz"],   // matches /GHZ\b/ only
    ["テラヘルツは1thzです。", "THz"], // matches /thz\b/ only
    ["テラヘルツは1THZです。", "THz"], // matches /THZ\b/ only
  ];

  for (const [text, correct] of singleMatchCases) {
    it(`flags "${text}" → ${correct}`, () => {
      const issues = rule().lint(text, CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe(correct);
    });
  }

  // khz (all lowercase): matches /khz\b/gi — one match, → kHz
  it("flags '3khz' (all lowercase) → kHz", () => {
    const issues = rule().lint("クロックは3khzです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("kHz");
  });

  // KHz and KHZ both match the /gi pattern; each input gets ≥1 issue with correct replacement
  it("flags 'KHz' → kHz (may produce multiple issues from overlapping patterns)", () => {
    const issues = rule().lint("クロックは3KHzです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.some((i) => i.fix?.replacement === "kHz")).toBe(true);
  });

  it("flags 'KHZ' → kHz (may produce multiple issues from overlapping patterns)", () => {
    const issues = rule().lint("クロックは3KHZです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.some((i) => i.fix?.replacement === "kHz")).toBe(true);
  });
});

describe("jtf-4-3-7 — 正しい表記は flagしない", () => {
  const clean = [
    "周波数は50Hzです。",
    "クロックは3kHzです。",
    "帯域は5MHzです。",
    "Wi-Fiは2.4GHzです。",
    "テラヘルツは1THzです。",
  ];

  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-4-3-7 — エッジケース", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("50hz。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("reference section is 4.3.7", () => {
    const issues = rule().lint("50hz", CONFIG);
    expect(issues[0].reference?.section).toBe("4.3.7");
  });

  it("does not flag when no digit precedes the unit", () => {
    // lookbehind requires a digit immediately before
    expect(rule().lint("Hz単位で測定。", CONFIG)).toHaveLength(0);
  });

  it("flags multiple wrong-case frequency units in one string", () => {
    const issues = rule().lint("帯域5mhzおよびクロック3khzを確認。", CONFIG);
    // both mhz and khz each match one pattern → at least 2 issues
    expect(issues.length).toBeGreaterThanOrEqual(2);
    const replacements = issues.map((i) => i.fix?.replacement);
    expect(replacements).toContain("MHz");
    expect(replacements).toContain("kHz");
  });
});
