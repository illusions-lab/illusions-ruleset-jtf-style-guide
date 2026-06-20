import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfPeriodComma } from "../src/rules/jtf-3-1-3";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfPeriodComma(createTestContext(), manifest);

describe("jtf-3-1-3 — 半角カンマの検出（非ASCII間）", () => {
  it("flags comma between two non-ASCII characters", () => {
    const text = "データを処理します,次の画面に進みます。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("、");
    expect(issues[0].originalText).toBe(",");
    expect(issues[0].reference?.section).toBe("3.1.3");
  });

  it("flags comma between full-width characters (e.g. katakana)", () => {
    const text = "テスト,チェック";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("、");
  });
});

describe("jtf-3-1-3 — 半角ピリオドの検出（非ASCII間）", () => {
  it("flags period between two non-ASCII characters", () => {
    const text = "データを処理します.次の画面に進みます。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("。");
    expect(issues[0].originalText).toBe(".");
  });

  it("flags period between full-width characters", () => {
    const text = "完了しました.終わります";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("。");
  });
});

describe("jtf-3-1-3 — 正しい形は flagしない", () => {
  it("does not flag comma between ASCII characters", () => {
    expect(rule().lint("a,b,c", CONFIG)).toHaveLength(0);
  });

  it("does not flag period between ASCII characters (URL, decimal)", () => {
    expect(rule().lint("www.example.com", CONFIG)).toHaveLength(0);
  });

  it("does not flag comma with one ASCII side", () => {
    // ASCII on right side — pattern requires both sides non-ASCII
    expect(rule().lint("日本語,ASCII", CONFIG)).toHaveLength(0);
  });

  it("does not flag period with one ASCII side", () => {
    expect(rule().lint("日本語.ASCII", CONFIG)).toHaveLength(0);
  });

  it("leaves correct Japanese text untouched", () => {
    expect(rule().lint("データを処理します。次の画面に進みます。", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-3-1-3 — edge cases", () => {
  it("does nothing when disabled", () => {
    expect(rule().lint("データ,チェック", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("flags both comma and period in same text", () => {
    const text = "完了しました,次へ.進みます";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(2);
    expect(issues[0].fix?.replacement).toBe("、");
    expect(issues[1].fix?.replacement).toBe("。");
  });

  it("messageJa mentions 半角カンマ for comma issue", () => {
    const issues = rule().lint("テスト,チェック", CONFIG);
    expect(issues[0].messageJa).toContain("半角カンマ");
  });

  it("messageJa mentions 半角ピリオド for period issue", () => {
    const issues = rule().lint("完了しました.終わります", CONFIG);
    expect(issues[0].messageJa).toContain("半角ピリオド");
  });
});
