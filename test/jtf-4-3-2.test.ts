import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfLengthUnit } from "../src/rules/jtf-4-3-2";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfLengthUnit(createTestContext(), manifest);

describe("jtf-4-3-2 — 長さ単位の大小誤りを検出", () => {
  it("flags MM → mm", () => {
    const issues = rule().lint("幅は3MMです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.every((i) => i.fix?.replacement === "mm")).toBe(true);
    expect(issues[0].reference?.section).toBe("4.3.2");
  });

  it("flags CM → cm", () => {
    const issues = rule().lint("厚さは10CMです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.every((i) => i.fix?.replacement === "cm")).toBe(true);
    expect(issues[0].reference?.section).toBe("4.3.2");
  });

  it("flags Cm → cm (overlapping with /CM/gi — both patterns cover Cm)", () => {
    // Source has both /CM\b/gi and /Cm\b/g; /CM/gi already matches Cm,
    // so Cm produces ≥1 issue all replaced with "cm".
    const issues = rule().lint("厚さは10Cmです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.every((i) => i.fix?.replacement === "cm")).toBe(true);
  });

  it("flags KM → km", () => {
    const issues = rule().lint("距離は5KMです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.every((i) => i.fix?.replacement === "km")).toBe(true);
    expect(issues[0].reference?.section).toBe("4.3.2");
  });

  it("flags Km → km", () => {
    const issues = rule().lint("距離は5Kmです。", CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.every((i) => i.fix?.replacement === "km")).toBe(true);
  });
});

describe("jtf-4-3-2 — 単独の大文字 M を検出", () => {
  it("flags capital M alone after digit (not followed by letters)", () => {
    const issues = rule().lint("全長1.5Mです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("m");
    expect(issues[0].reference?.section).toBe("4.3.2");
  });

  it("does not flag M in MHz (followed by letters)", () => {
    // M followed by H is excluded by the lookahead [^a-zA-Z/²³]
    expect(rule().lint("周波数は100MHzです。", CONFIG)).toHaveLength(0);
  });

  it("does not flag M in m/s context (followed by /)", () => {
    expect(rule().lint("速度は10M/sです。", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-4-3-2 — 正しい表記は flag しない", () => {
  const clean = [
    "幅は3mmです。",
    "厚さは10cmです。",
    "距離は5kmです。",
    "全長1.5mです。",
  ];
  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-4-3-2 — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("幅は3MMです。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("messageJa contains the matched unit and correct unit", () => {
    const issues = rule().lint("幅は3MMです。", CONFIG);
    expect(issues[0].messageJa).toContain("MM");
    expect(issues[0].messageJa).toContain("mm");
  });

  it("flags multiple wrong-case length units in one sentence", () => {
    const issues = rule().lint("幅3MM、距離5KMです。", CONFIG);
    expect(issues).toHaveLength(2);
    const replacements = issues.map((i) => i.fix?.replacement);
    expect(replacements).toContain("mm");
    expect(replacements).toContain("km");
  });

  it("fix replacement for MM is lowercase mm", () => {
    const issues = rule().lint("3MM", CONFIG);
    expect(issues[0].fix?.replacement).toBe("mm");
    expect(issues[0].originalText).toBe("MM");
  });
});
