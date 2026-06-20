import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfParenthesesSpace } from "../src/rules/jtf-3-3-1-parentheses-space";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfParenthesesSpace(createTestContext(), manifest);

describe("jtf-3-3-1-parentheses-space — かっこ外側（前後）スペース検出", () => {
  it("flags ASCII space before opening bracket 「（」", () => {
    const text = "次の （例）を見てください。";
    const issues = rule().lint(text, CONFIG);
    const spaceBeforeOpen = issues.find((i) => i.message.includes("before opening"));
    expect(spaceBeforeOpen).toBeDefined();
    expect(spaceBeforeOpen!.fix?.replacement).toBe("");
    expect(spaceBeforeOpen!.originalText).toBe(" ");
    expect(spaceBeforeOpen!.reference?.section).toBe("3.3.1");
  });

  it("flags ASCII space after closing bracket 「）」", () => {
    const text = "（例） の結果";
    const issues = rule().lint(text, CONFIG);
    const spaceAfterClose = issues.find((i) => i.message.includes("after closing"));
    expect(spaceAfterClose).toBeDefined();
    expect(spaceAfterClose!.fix?.replacement).toBe("");
  });

  it("flags space before 「」 (kagi brackets)", () => {
    const text = "彼は 「こんにちは」と言った。";
    const issues = rule().lint(text, CONFIG);
    const outer = issues.find((i) => i.message.includes("before opening"));
    expect(outer).toBeDefined();
    expect(outer!.fix?.replacement).toBe("");
  });
});

describe("jtf-3-3-1-parentheses-space — かっこ内側スペース検出", () => {
  it("flags ASCII space after opening bracket 「（ 」", () => {
    const text = "（ 例）を見る。";
    const issues = rule().lint(text, CONFIG);
    const inner = issues.find((i) => i.message.includes("inside opening"));
    expect(inner).toBeDefined();
    expect(inner!.fix?.replacement).toBe("");
    expect(inner!.originalText).toBe(" ");
  });

  it("flags ASCII space before closing bracket 「 ）」", () => {
    const text = "（例 ）を見る。";
    const issues = rule().lint(text, CONFIG);
    const inner = issues.find((i) => i.message.includes("inside closing"));
    expect(inner).toBeDefined();
    expect(inner!.fix?.replacement).toBe("");
  });

  it("flags space inside 「」", () => {
    const text = "「 こんにちは」";
    const issues = rule().lint(text, CONFIG);
    expect(issues.some((i) => i.message.includes("inside opening"))).toBe(true);
  });
});

describe("jtf-3-3-1-parentheses-space — 正しい形は flagしない", () => {
  it("does not flag brackets with no surrounding spaces", () => {
    expect(rule().lint("（例）を見てください。", CONFIG)).toHaveLength(0);
  });

  it("does not flag 「」 with no surrounding spaces", () => {
    expect(rule().lint("「こんにちは」と言った。", CONFIG)).toHaveLength(0);
  });

  it("does not flag 『』 with no surrounding spaces", () => {
    expect(rule().lint("『タイトル』です。", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-3-3-1-parentheses-space — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("（ 例）", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("flags full-width space (U+3000) before opening bracket", () => {
    // U+3000 ideographic space should also be caught
    const text = "次の　（例）を見る。";
    const issues = rule().lint(text, CONFIG);
    const outer = issues.find((i) => i.message.includes("before opening"));
    expect(outer).toBeDefined();
    expect(outer!.fix?.replacement).toBe("");
  });

  it("flags full-width space (U+3000) inside opening bracket", () => {
    const text = "（　例）";
    const issues = rule().lint(text, CONFIG);
    const inner = issues.find((i) => i.message.includes("inside opening"));
    expect(inner).toBeDefined();
  });

  it("from/to spans exactly the space character (1 char width)", () => {
    const issues = rule().lint("（ 例）", CONFIG);
    expect(issues[0].to - issues[0].from).toBe(1);
  });

  it("detects multiple space violations in the same string", () => {
    // space before open + space after close
    const text = " （例） ";
    const issues = rule().lint(text, CONFIG);
    expect(issues.length).toBeGreaterThanOrEqual(2);
  });

  it("messageJa mentions 外側 for outside-space issues", () => {
    const issues = rule().lint("次の （例）", CONFIG);
    const outer = issues.find((i) => i.message.includes("before opening"));
    expect(outer!.messageJa).toContain("外側");
  });

  it("messageJa mentions 内側 for inside-space issues", () => {
    const issues = rule().lint("（ 例）", CONFIG);
    const inner = issues.find((i) => i.message.includes("inside opening"));
    expect(inner!.messageJa).toContain("内側");
  });
});
