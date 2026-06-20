import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfAreaVolumeUnit } from "../src/rules/jtf-4-3-4";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfAreaVolumeUnit(createTestContext(), manifest);

describe("jtf-4-3-4 — 上付き数字なしの面積・体積単位を検出", () => {
  const cases: Array<[string, string]> = [
    ["床面積は75m2です。", "m²"],
    ["体積は1m3です。", "m³"],
    ["面積は30cm2です。", "cm²"],
    ["容積は500cm3です。", "cm³"],
    ["面積は5km2です。", "km²"],
  ];

  for (const [text, correct] of cases) {
    it(`flags "${text}" → ${correct}`, () => {
      const issues = rule().lint(text, CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe(correct);
      expect(issues[0].reference?.section).toBe("4.3.4");
    });
  }
});

describe("jtf-4-3-4 — 容量単位の大小誤りを検出", () => {
  it("flags ML → mL", () => {
    const issues = rule().lint("容量500MLです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("mL");
    expect(issues[0].reference?.section).toBe("4.3.4");
  });

  it("flags ml → mL", () => {
    const issues = rule().lint("容量500mlです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("mL");
  });

  it("flags lowercase l for liter → L", () => {
    const issues = rule().lint("容量2lです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("L");
  });

  it("does not flag correct mL", () => {
    expect(rule().lint("容量500mLです。", CONFIG)).toHaveLength(0);
  });

  it("does not flag correct L", () => {
    expect(rule().lint("容量2Lです。", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-4-3-4 — 正しい上付き表記は flag しない", () => {
  const clean = [
    "床面積は75m²です。",
    "体積は1m³です。",
    "面積は30cm²です。",
  ];
  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-4-3-4 — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("床面積は75m2です。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("messageJa contains the matched text and correct text", () => {
    const issues = rule().lint("面積5m2。", CONFIG);
    expect(issues[0].messageJa).toContain("m2");
    expect(issues[0].messageJa).toContain("m²");
  });

  it("does not flag m2 when followed by a digit (e.g. coordinate '1m23')", () => {
    // lookahead (?=[^0-9]|$) — m2 followed by digit '3' is not flagged
    expect(rule().lint("1m23。", CONFIG)).toHaveLength(0);
  });

  it("flags m2 and ML together in one sentence", () => {
    const issues = rule().lint("面積5m2、容量500ML。", CONFIG);
    expect(issues).toHaveLength(2);
    const replacements = issues.map((i) => i.fix?.replacement);
    expect(replacements).toContain("m²");
    expect(replacements).toContain("mL");
  });
});
