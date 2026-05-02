import { parseConfig } from "./parser";
import { analyzeOpenVpn, analyzeUnknown, analyzeWireGuard } from "./rules";
import type { AnalysisResult, Finding, RuleCategory } from "./types";
import type { Language } from "../i18n/dictionaries";

function scoreFindings(findings: Finding[]) {
  const penalty = findings.reduce((sum, finding) => sum + finding.weight, 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

function scoreBreakdown(findings: Finding[]) {
  return findings.reduce<Partial<Record<RuleCategory, number>>>((breakdown, finding) => {
    breakdown[finding.category] = (breakdown[finding.category] ?? 0) + finding.weight;
    return breakdown;
  }, {});
}

function riskLevel(score: number): AnalysisResult["riskLevel"] {
  if (score >= 75) {
    return "low";
  }

  if (score >= 45) {
    return "medium";
  }

  return "high";
}

const reportText = {
  ru: {
    unknown: "Не распознан",
    title: "Scandium - отчёт анализа безопасности VPN-конфигурации",
    file: "Файл",
    type: "Тип",
    score: "Оценка",
    riskLevel: "Уровень риска",
    scoreBreakdown: "Разбивка оценки",
    category: "Категория",
    confidence: "Уверенность",
    evidence: "Доказательства",
    line: "строка",
    findings: "Найденные замечания:",
    description: "Описание",
    recommendation: "Рекомендация",
    summary: (fileName: string, type: string, score: number, risk: string) =>
      `Файл ${fileName} распознан как ${type}. Итоговая оценка: ${score}/100. Уровень риска: ${risk}.`,
    risk: { low: "Низкий", medium: "Средний", high: "Высокий" }
  },
  en: {
    unknown: "Unknown",
    title: "Scandium - VPN configuration security report",
    file: "File",
    type: "Type",
    score: "Score",
    riskLevel: "Risk level",
    scoreBreakdown: "Score breakdown",
    category: "Category",
    confidence: "Confidence",
    evidence: "Evidence",
    line: "line",
    findings: "Findings:",
    description: "Description",
    recommendation: "Recommendation",
    summary: (fileName: string, type: string, score: number, risk: string) =>
      `File ${fileName} was recognized as ${type}. Final score: ${score}/100. Risk level: ${risk}.`,
    risk: { low: "Low", medium: "Medium", high: "High" }
  },
  kk: {
    unknown: "Анықталмады",
    title: "Scandium - VPN конфигурациясының қауіпсіздік есебі",
    file: "Файл",
    type: "Түрі",
    score: "Баға",
    riskLevel: "Тәуекел деңгейі",
    scoreBreakdown: "Баға бөлінісі",
    category: "Санат",
    confidence: "Сенімділік",
    evidence: "Дәлелдер",
    line: "жол",
    findings: "Анықталған ескертулер:",
    description: "Сипаттама",
    recommendation: "Ұсыныс",
    summary: (fileName: string, type: string, score: number, risk: string) =>
      `${fileName} файлы ${type} ретінде анықталды. Қорытынды баға: ${score}/100. Тәуекел деңгейі: ${risk}.`,
    risk: { low: "Төмен", medium: "Орташа", high: "Жоғары" }
  }
} as const;

function riskLevelLabel(level: AnalysisResult["riskLevel"], language: Language) {
  return reportText[language].risk[level];
}

export function analyzeConfig(fileName: string, content: string, language: Language): AnalysisResult {
  const parsed = parseConfig(content);
  const findings = parsed.type === "openvpn"
    ? analyzeOpenVpn(parsed, language)
    : parsed.type === "wireguard"
      ? analyzeWireGuard(parsed, language)
      : analyzeUnknown(language);
  const score = scoreFindings(findings);
  const level = riskLevel(score);
  const text = reportText[language];

  return {
    fileName,
    type: parsed.type,
    score,
    riskLevel: level,
    findings,
    scoreBreakdown: scoreBreakdown(findings),
    summary: text.summary(fileName, parsed.type, score, riskLevelLabel(level, language))
  };
}

export function formatReport(result: AnalysisResult, language: Language) {
  const text = reportText[language];
  const typeLabel = result.type === "openvpn"
    ? "OpenVPN"
    : result.type === "wireguard"
      ? "WireGuard"
      : text.unknown;

  const lines = [
    text.title,
    "",
    `${text.file}: ${result.fileName}`,
    `${text.type}: ${typeLabel}`,
    `${text.score}: ${result.score}/100`,
    `${text.riskLevel}: ${riskLevelLabel(result.riskLevel, language)}`
  ];

  const breakdownEntries = Object.entries(result.scoreBreakdown).filter(([, value]) => value > 0);
  if (breakdownEntries.length > 0) {
    lines.push("");
    lines.push(`${text.scoreBreakdown}:`);
    breakdownEntries.forEach(([category, value]) => {
      lines.push(`- ${category}: -${value}`);
    });
  }

  lines.push("");
  lines.push(text.findings);

  result.findings.forEach((finding, index) => {
    lines.push("");
    lines.push(`${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
    lines.push(`${text.category}: ${finding.category}`);
    lines.push(`${text.confidence}: ${finding.confidence}`);
    if (finding.evidence?.length) {
      lines.push(`${text.evidence}:`);
      finding.evidence.forEach((item) => {
        lines.push(`- ${text.line} ${item.line}: ${item.raw}`);
      });
    }
    lines.push(`${text.description}: ${finding.description}`);
    lines.push(`${text.recommendation}: ${finding.recommendation}`);
  });

  return lines.join("\n");
}
