/**
 * jtf-3-3-1-parentheses-space — かっこ周辺のスペース
 *
 * JTFスタイルガイド 3.3.1: かっこの外側、内側ともにスペースを入れない。
 * 4方向（開き外側・閉じ外側・開き内側・閉じ内側）を個別の regex パスで検出する。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef } from "./shared";

export function createJtfParenthesesSpace(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-3-3-1-parentheses-space");
  if (!meta) throw new Error("manifest is missing the jtf-3-3-1-parentheses-space rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Space before opening bracket: " （", " 「", " ［"
      const beforeOpen = /[ 　](?=[（「［『【〈《])/g;
      let m: RegExpExecArray | null;
      while ((m = beforeOpen.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Remove space before opening bracket",
          messageJa: "JTFスタイルガイドに基づき、かっこの外側にスペースを入れないでください。",
          from: m.index,
          to: m.index + 1,
          originalText: m[0],
          reference: jtfRef("3.3.1"),
          fix: { label: "Remove space", labelJa: "スペースを削除", replacement: "" },
        });
      }

      // Space after closing bracket: "）  ", "」 ", "］ "
      const afterClose = /(?<=[）」］』】〉》])[ 　]/g;
      while ((m = afterClose.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Remove space after closing bracket",
          messageJa: "JTFスタイルガイドに基づき、かっこの外側にスペースを入れないでください。",
          from: m.index,
          to: m.index + 1,
          originalText: m[0],
          reference: jtfRef("3.3.1"),
          fix: { label: "Remove space", labelJa: "スペースを削除", replacement: "" },
        });
      }

      // Space after opening bracket: "（ ", "「 "
      const afterOpen = /(?<=[（「［『【〈《])[ 　]/g;
      while ((m = afterOpen.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Remove space inside opening bracket",
          messageJa: "JTFスタイルガイドに基づき、かっこの内側にスペースを入れないでください。",
          from: m.index,
          to: m.index + 1,
          originalText: m[0],
          reference: jtfRef("3.3.1"),
          fix: { label: "Remove space", labelJa: "スペースを削除", replacement: "" },
        });
      }

      // Space before closing bracket: " ）", " 」"
      const beforeClose = /[ 　](?=[）」］』】〉》])/g;
      while ((m = beforeClose.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Remove space inside closing bracket",
          messageJa: "JTFスタイルガイドに基づき、かっこの内側にスペースを入れないでください。",
          from: m.index,
          to: m.index + 1,
          originalText: m[0],
          reference: jtfRef("3.3.1"),
          fix: { label: "Remove space", labelJa: "スペースを削除", replacement: "" },
        });
      }

      return issues;
    }
  }

  return new Rule(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
