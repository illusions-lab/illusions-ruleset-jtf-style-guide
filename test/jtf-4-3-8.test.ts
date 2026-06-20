import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfSpeedUnit } from "../src/rules/jtf-4-3-8";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfSpeedUnit(createTestContext(), manifest);

describe("jtf-4-3-8 — 速度の単位（SI）— 検出（単一パターン一致）", () => {
  // KM/H (all uppercase ASCII) only matches the /gi pattern once — 1 issue.
  it("flags '100KM/H' (uppercase) → km/h", () => {
    const issues = rule().lint("速度は100KM/Hです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("km/h");
  });

  it("flags '30M/S' → m/s", () => {
    const issues = rule().lint("風速は30M/Sです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("m/s");
  });

  it("flags '30M/s' → m/s", () => {
    const issues = rule().lint("風速は30M/sです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("m/s");
  });

  it("flags '30m/S' → m/s", () => {
    const issues = rule().lint("風速は30m/Sです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("m/s");
  });

  // km/H and Km/h both overlap with the /gi KM/H pattern, so ≥1 issue with correct replacement
  it("flags 'km/H' → km/h (may overlap with /gi pattern)", () => {
    const issues = rule().lint("速度は100km/Hです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.some((i) => i.fix?.replacement === "km/h")).toBe(true);
  });

  it("flags 'Km/h' → km/h (may overlap with /gi pattern)", () => {
    const issues = rule().lint("速度は100Km/hです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.some((i) => i.fix?.replacement === "km/h")).toBe(true);
  });
});

describe("jtf-4-3-8 — 正しい表記は flagしない", () => {
  it("leaves km/h untouched", () => {
    expect(rule().lint("速度は100km/hです。", CONFIG)).toHaveLength(0);
  });

  it("leaves m/s untouched", () => {
    expect(rule().lint("風速は30m/sです。", CONFIG)).toHaveLength(0);
  });

  it("leaves text without speed units untouched", () => {
    expect(rule().lint("速さを測定します。", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-4-3-8 — エッジケース", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("100KM/H", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("reference section is 4.3.8", () => {
    const issues = rule().lint("100KM/H", CONFIG);
    expect(issues[0].reference?.section).toBe("4.3.8");
  });

  it("messageJa mentions JTFスタイルガイド", () => {
    const issues = rule().lint("100KM/H", CONFIG);
    expect(issues[0].messageJa).toContain("JTFスタイルガイド");
  });

  it("does not flag when no digit precedes the unit", () => {
    // lookbehind requires a digit immediately before
    expect(rule().lint("km/h単位は正しい。", CONFIG)).toHaveLength(0);
  });

  it("flags KM/H and M/S together, each producing correct replacement", () => {
    const issues = rule().lint("時速100KM/Hで走行、秒速30M/Sの風。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(2);
    const replacements = issues.map((i) => i.fix?.replacement);
    expect(replacements).toContain("km/h");
    expect(replacements).toContain("m/s");
  });
});
