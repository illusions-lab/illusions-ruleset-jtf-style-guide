import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfBracketsFullwidth } from "../src/rules/jtf-3-3-brackets-fullwidth";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfBracketsFullwidth(createTestContext(), manifest);

describe("jtf-3-3-brackets-fullwidth — 半角かっこ検出（日本語隣接）", () => {
  it("flags half-width ( after Japanese character", () => {
    const text = "ファイル(例)を開く。";
    const issues = rule().lint(text, CONFIG);
    const open = issues.find((i) => i.originalText === "(");
    expect(open).toBeDefined();
    expect(open!.fix?.replacement).toBe("（");
    expect(open!.reference?.section).toBe("3.3");
  });

  it("flags half-width ) before Japanese character", () => {
    const text = "(例)を開く";
    const issues = rule().lint(text, CONFIG);
    const close = issues.find((i) => i.originalText === ")");
    expect(close).toBeDefined();
    expect(close!.fix?.replacement).toBe("）");
  });

  it("flags half-width [ before Japanese character", () => {
    const text = "[ファイル]メニュー";
    const issues = rule().lint(text, CONFIG);
    const open = issues.find((i) => i.originalText === "[");
    expect(open).toBeDefined();
    expect(open!.fix?.replacement).toBe("［");
  });

  it("flags half-width ] after Japanese character", () => {
    const text = "[ファイル]メニュー";
    const issues = rule().lint(text, CONFIG);
    const close = issues.find((i) => i.originalText === "]");
    expect(close).toBeDefined();
    expect(close!.fix?.replacement).toBe("］");
  });

  it("flags half-width ｢ (halfwidth corner bracket) before Japanese", () => {
    const text = "｢こんにちは｣";
    const issues = rule().lint(text, CONFIG);
    const open = issues.find((i) => i.originalText === "｢");
    expect(open).toBeDefined();
    expect(open!.fix?.replacement).toBe("「");
  });

  it("flags half-width ｣ (halfwidth corner bracket) after Japanese", () => {
    const text = "｢こんにちは｣";
    const issues = rule().lint(text, CONFIG);
    const close = issues.find((i) => i.originalText === "｣");
    expect(close).toBeDefined();
    expect(close!.fix?.replacement).toBe("」");
  });
});

describe("jtf-3-3-brackets-fullwidth — 正しい形は flagしない（false positives）", () => {
  it("does not flag full-width brackets adjacent to Japanese", () => {
    expect(rule().lint("ファイル（例）を開く。", CONFIG)).toHaveLength(0);
  });

  it("does not flag half-width brackets between ASCII characters", () => {
    expect(rule().lint("func(arg)", CONFIG)).toHaveLength(0);
  });

  it("does not flag half-width brackets with no adjacent Japanese characters", () => {
    expect(rule().lint("[1, 2, 3]", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-3-3-brackets-fullwidth — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("ファイル(例)", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("from/to spans exactly the bracket character (1 char width)", () => {
    const issues = rule().lint("ファイル(例)", CONFIG);
    const open = issues.find((i) => i.originalText === "(");
    expect(open!.to - open!.from).toBe(1);
  });

  it("messageJa contains the half-width and full-width bracket pair", () => {
    const issues = rule().lint("ファイル(例)", CONFIG);
    const open = issues.find((i) => i.originalText === "(");
    expect(open!.messageJa).toContain("(");
    expect(open!.messageJa).toContain("（");
  });

  it("flags ( adjacent to kanji", () => {
    const text = "漢字(test)";
    const issues = rule().lint(text, CONFIG);
    expect(issues.some((i) => i.originalText === "(")).toBe(true);
  });

  it("flags ) adjacent to kanji", () => {
    const text = "(test)漢字";
    const issues = rule().lint(text, CONFIG);
    expect(issues.some((i) => i.originalText === ")")).toBe(true);
  });

  it("reference standard contains JTF", () => {
    const issues = rule().lint("ファイル(例)", CONFIG);
    expect(issues[0].reference?.standard).toContain("JTF");
  });
});
