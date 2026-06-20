/**
 * jtf-2-1-5-fullwidth-kana — 半角カタカナを全角カタカナへ統一
 *
 * JTF日本語標準スタイルガイド 2.1.5 は漢字・ひらがな・カタカナを全角で表記
 * するよう定めており、半角カタカナの使用を禁じている。
 * 本ルールは U+FF66-U+FF9F の半角カタカナを検出し、対応する全角文字への
 * 置換を提案する。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef, HALF_TO_FULL_KANA } from "./shared";

export function createJtfFullwidthKana(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-2-1-5-fullwidth-kana");
  if (!meta) throw new Error("manifest is missing the jtf-2-1-5-fullwidth-kana rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      const pattern = /[ｦ-ﾟ]/g;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        const halfChar = m[0];
        const fullChar = HALF_TO_FULL_KANA.get(halfChar) ?? halfChar;
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: `Use full-width katakana instead of half-width: ${halfChar} -> ${fullChar}`,
          messageJa: `JTFスタイルガイドに基づき、半角カタカナ（${halfChar}）は全角（${fullChar}）で表記してください。`,
          from: m.index,
          to: m.index + 1,
          originalText: halfChar,
          reference: jtfRef("2.1.5"),
          fix: {
            label: `Replace with ${fullChar}`,
            labelJa: `「${fullChar}」に置換`,
            replacement: fullChar,
          },
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
