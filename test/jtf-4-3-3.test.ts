import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfMassUnit } from "../src/rules/jtf-4-3-3";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfMassUnit(createTestContext(), manifest);

describe("jtf-4-3-3 — 質量単位の大小誤りを検出", () => {
  const cases: Array<[string, string]> = [
    ["重さは60KGです。", "kg"],
    ["重さは60Kgです。", "kg"],
    ["用量は500MGです。", "mg"],
    ["用量は500Mgです。", "mg"],
    // Gr requires a preceding digit (lookbehind (?<=\d\s*)); test accordingly
    ["重さ5Grです。", "g"],
  ];

  for (const [text, correct] of cases) {
    it(`flags "${text}" → ${correct}`, () => {
      const issues = rule().lint(text, CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe(correct);
      expect(issues[0].reference?.section).toBe("4.3.3");
    });
  }
});

describe("jtf-4-3-3 — 単独の大文字 G を検出", () => {
  it("flags capital G alone after digit (not followed by letters)", () => {
    const issues = rule().lint("重さは5Gです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("g");
    expect(issues[0].reference?.section).toBe("4.3.3");
  });

  it("does not flag G when followed by letters (e.g. GB)", () => {
    // G followed by B is excluded by lookahead [^a-zA-Z]
    expect(rule().lint("容量は500GBです。", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-4-3-3 — 正しい表記は flag しない", () => {
  const clean = [
    "重さは60kgです。",
    "用量は500mgです。",
    "重さは5gです。",
  ];
  for (const text of clean) {
    it(`leaves "${text}" untouched`, () => {
      expect(rule().lint(text, CONFIG)).toHaveLength(0);
    });
  }
});

describe("jtf-4-3-3 — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("重さは60KGです。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("messageJa contains the matched unit and correct unit", () => {
    const issues = rule().lint("重さは60KGです。", CONFIG);
    expect(issues[0].messageJa).toContain("KG");
    expect(issues[0].messageJa).toContain("kg");
  });

  it("flags both KG and MG in one sentence", () => {
    const issues = rule().lint("荷物60KG、薬品500MG。", CONFIG);
    expect(issues).toHaveLength(2);
    const replacements = issues.map((i) => i.fix?.replacement);
    expect(replacements).toContain("kg");
    expect(replacements).toContain("mg");
  });

  it("Gr after digit is flagged and replaced with g", () => {
    const issues = rule().lint("重さ5Grです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("g");
  });

  it("Gr without preceding digit is NOT flagged (lookbehind requires digit)", () => {
    // "単位はGrです。" — no digit before Gr, so lookbehind (?<=\d\s*) does not match
    expect(rule().lint("単位はGrです。", CONFIG)).toHaveLength(0);
  });
});
