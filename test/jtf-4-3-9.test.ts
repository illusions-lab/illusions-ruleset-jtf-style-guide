import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfDataRateUnit } from "../src/rules/jtf-4-3-9";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfDataRateUnit(createTestContext(), manifest);

describe("jtf-4-3-9 — 伝送速度の単位 — 検出（単一パターン一致）", () => {
  // These each match exactly one pattern (no overlap).
  const singleMatchCases: Array<[string, string]> = [
    ["速度は100BPSです。", "bps"],    // /BPS\b/ only
    ["速度は100Bpsです。", "bps"],    // /Bps\b/ only
    ["速度は100MBPSです。", "Mbps"],  // /MBPS\b/ only
    ["速度は100mbpsです。", "Mbps"],  // /mbps\b/ only
    ["速度は100MBpsです。", "Mbps"],  // /MBps\b/ only
    ["速度は100GBPSです。", "Gbps"],  // /GBPS\b/ only
    ["速度は100gbpsです。", "Gbps"],  // /gbps\b/ only
    ["速度は100GBpsです。", "Gbps"],  // /GBps\b/ only
    ["速度は100TBPSです。", "Tbps"],  // /TBPS\b/ only
    ["速度は100tbpsです。", "Tbps"],  // /tbps\b/ only
  ];

  for (const [text, correct] of singleMatchCases) {
    it(`flags "${text}" → ${correct}`, () => {
      const issues = rule().lint(text, CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe(correct);
    });
  }

  // KBPS (all caps) matches /KBPS\b/gi only once — 1 issue
  it("flags '100KBPS' → kbps", () => {
    const issues = rule().lint("速度は100KBPSです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("kbps");
  });

  // Kbps overlaps with /KBPS\b/gi (gi matches 'Kbps'), so ≥1 issue with correct replacement
  it("flags '100Kbps' → kbps (may overlap with /gi pattern)", () => {
    const issues = rule().lint("速度は100Kbpsです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.some((i) => i.fix?.replacement === "kbps")).toBe(true);
  });
});

describe("jtf-4-3-9 — 正しい表記は flagしない", () => {
  const clean = [
    "速度は100bpsです。",
    "速度は100kbpsです。",
    "速度は100Mbpsです。",
    "速度は100Gbpsです。",
    "速度は100Tbpsです。",
  ];

  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-4-3-9 — エッジケース", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("100MBPS", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("reference section is 4.3.9", () => {
    const issues = rule().lint("100MBPS", CONFIG);
    expect(issues[0].reference?.section).toBe("4.3.9");
  });

  it("messageJa mentions JTFスタイルガイド", () => {
    const issues = rule().lint("100MBPS", CONFIG);
    expect(issues[0].messageJa).toContain("JTFスタイルガイド");
  });

  it("does not flag when no digit precedes the unit", () => {
    // lookbehind requires a digit immediately before
    expect(rule().lint("MBPS単位は誤り。", CONFIG)).toHaveLength(0);
  });

  it("flags MBPS and GBPS together, each producing correct replacement", () => {
    const issues = rule().lint("接続速度は100MBPSまたは1GBPSです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(2);
    const replacements = issues.map((i) => i.fix?.replacement);
    expect(replacements).toContain("Mbps");
    expect(replacements).toContain("Gbps");
  });

  it("flags KBPS (case-insensitive /gi pattern) → kbps", () => {
    const issues = rule().lint("速度は10KBPSです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("kbps");
  });
});
