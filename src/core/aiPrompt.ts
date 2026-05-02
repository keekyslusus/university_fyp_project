import type { Language } from "../i18n/dictionaries";
import { MAX_CONFIG_CHARS } from "./aiConfig";
import type { AnalysisResult } from "./types";

const promptLanguageName: Record<Language, string> = {
  ru: "Russian",
  en: "English",
  kk: "Kazakh"
};

function riskLevelLabel(level: AnalysisResult["riskLevel"], language: Language) {
  const labels = {
    ru: { low: "низкий", medium: "средний", high: "высокий" },
    en: { low: "low", medium: "medium", high: "high" },
    kk: { low: "төмен", medium: "орташа", high: "жоғары" }
  } as const;

  return labels[language][level];
}

export function buildAiPrompt(
  fileName: string,
  configContent: string,
  localAnalysis: AnalysisResult,
  language: Language
) {
  const findings = localAnalysis.findings
    .map((finding) => {
      const evidence = finding.evidence?.length
        ? finding.evidence.map((item) => `line ${item.line}: ${item.raw}`).join("; ")
        : "absence inferred from missing directive or section";

      return [
        `- ${finding.severity} / ${finding.category} / ${finding.confidence} confidence / weight ${finding.weight}: ${finding.title}.`,
        `  Description: ${finding.description}`,
        `  Evidence: ${evidence}`
      ].join("\n");
    })
    .join("\n");
  const scoreBreakdown = Object.entries(localAnalysis.scoreBreakdown)
    .map(([category, weight]) => `- ${category}: -${weight}`)
    .join("\n") || "- no penalties";
  const outputLanguage = promptLanguageName[language];

  return `You are a VPN security expert. Analyze the VPN configuration and Scandium's local rule findings.

Return only valid JSON without markdown. All user-facing text values must be written in ${outputLanguage}.
{
  "shortText": "brief conclusion up to 220 characters",
  "summary": "1-2 sentences with the general conclusion",
  "risks": ["short risk 1", "short risk 2", "short risk 3"],
  "actions": ["concrete action 1", "concrete action 2", "concrete action 3"],
  "conclusion": "final conclusion in one sentence",
  "details": "same meaning as connected text, 700-1000 characters"
}

Do not write an essay. Do not invent facts if a parameter is absent. Use no numbering inside risks and actions. Use 3-5 items at most.
When explaining a risk, refer only to provided evidence. If evidence is missing, say that the risk is inferred from absence of a directive or section.

File: ${fileName}
Type: ${localAnalysis.type}
Scandium score: ${localAnalysis.score}/100
Risk level: ${riskLevelLabel(localAnalysis.riskLevel, language)}

Score breakdown:
${scoreBreakdown}

Local findings:
${findings}

Configuration:
${configContent.slice(0, MAX_CONFIG_CHARS)}`;
}
