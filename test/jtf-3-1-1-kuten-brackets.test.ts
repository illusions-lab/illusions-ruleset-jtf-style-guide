import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfKutenBrackets } from "../src/rules/jtf-3-1-1-kuten-brackets";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfKutenBrackets(createTestContext(), manifest);

describe("jtf-3-1-1-kuten-brackets — 閉じかっこ前の句点を検出", () => {
  it("flags kuten before closing kagikakko 」", () => {
    const text = "A氏は「5月に新製品を発売します。」と述べました。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("");
    expect(issues[0].originalText).toBe("。");
    expect(issues[0].reference?.section).toBe("3.1.1");
  });

  it("flags kuten before closing maru-kakko ）", () => {
    const text = "結果（処理が完了しました。）を確認してください。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("");
  });

  it("flags kuten before ASCII closing paren )", () => {
    const text = "結果(処理が完了しました。)を確認してください。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("");
  });
});

describe("jtf-3-1-1-kuten-brackets — 正しい形は flagしない", () => {
  it("does not flag kuten when no closing bracket follows", () => {
    expect(rule().lint("処理が完了しました。", CONFIG)).toHaveLength(0);
  });

  it("does not flag closing bracket without preceding kuten", () => {
    expect(rule().lint("A氏は「5月に新製品を発売します」と述べました。", CONFIG)).toHaveLength(0);
  });

  it("does not flag kuten in normal sentence", () => {
    expect(rule().lint("これはテストです。次の画面へ進みます。", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-3-1-1-kuten-brackets — edge cases", () => {
  it("does nothing when disabled", () => {
    const text = "A氏は「発売します。」と述べました。";
    expect(rule().lint(text, { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("messageJa mentions 閉じかっこ", () => {
    const issues = rule().lint("「完了しました。」", CONFIG);
    expect(issues[0].messageJa).toContain("閉じかっこ");
  });

  it("flags multiple kuten-before-bracket in same text", () => {
    const text = "「完了しました。」と「成功しました。」が表示されます。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(2);
  });

  it("fix is empty string (delete the kuten)", () => {
    const issues = rule().lint("「完了しました。」", CONFIG);
    expect(issues[0].fix?.label).toBe("Remove 。");
    expect(issues[0].fix?.replacement).toBe("");
  });
});
