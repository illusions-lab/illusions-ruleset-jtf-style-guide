import { describe, it, expect } from "vitest";
import { createTestContext, CONFIG } from "./test-kit";
import manifestJson from "../manifest.json";
import type { RulesetManifest } from "illusions-lint-sdk";
import { createJtfTemperatureUnit } from "../src/rules/jtf-4-3-6";

const manifest = manifestJson as RulesetManifest;
const rule = () => createJtfTemperatureUnit(createTestContext(), manifest);

describe("jtf-4-3-6 — 温度の単位（℃）— 検出", () => {
  it("flags °C (degree sign + C) and suggests ℃", () => {
    const issues = rule().lint("室温は25°Cです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("℃");
    expect(issues[0].originalText).toBe("°C");
  });

  it("fix replacement is exactly ℃ (U+2103)", () => {
    const issues = rule().lint("設定温度は100°Cです。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("℃");
  });
});

describe("jtf-4-3-6 — 正しい表記は flagしない", () => {
  it("leaves ℃ (U+2103) untouched", () => {
    expect(rule().lint("室温は25℃です。", CONFIG)).toHaveLength(0);
  });

  it("leaves text without temperature units untouched", () => {
    expect(rule().lint("今日は暑い日です。", CONFIG)).toHaveLength(0);
  });
});

describe("jtf-4-3-6 — 複数検出とエッジケース", () => {
  it("flags multiple °C occurrences in one sentence", () => {
    const issues = rule().lint("最低気温は0°C、最高気温は35°Cでした。", CONFIG);
    expect(issues).toHaveLength(2);
    expect(issues[0].fix?.replacement).toBe("℃");
    expect(issues[1].fix?.replacement).toBe("℃");
  });

  it("does nothing when disabled", () => {
    expect(rule().lint("室温は25°Cです。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("reference section is 4.3.6", () => {
    const issues = rule().lint("25°C", CONFIG);
    expect(issues[0].reference?.section).toBe("4.3.6");
  });

  it("messageJa mentions JTFスタイルガイド", () => {
    const issues = rule().lint("25°C", CONFIG);
    expect(issues[0].messageJa).toContain("JTFスタイルガイド");
  });

  it("span covers exactly 2 characters (°C)", () => {
    const text = "温度は25°Cです。";
    // 温(0)度(1)は(2)2(3)5(4)°(5)C(6) → from=5, to=7
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].from).toBe(5);
    expect(issues[0].to).toBe(7);
  });
});
