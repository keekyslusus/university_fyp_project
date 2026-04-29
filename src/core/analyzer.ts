import { parseConfig } from "./parser";
import { analyzeOpenVpn, analyzeUnknown, analyzeWireGuard } from "./rules";
import type { AnalysisResult, Finding, Severity } from "./types";
import type { Language } from "../i18n/dictionaries";

const severityWeight: Record<Severity, number> = {
  info: 0,
  low: 8,
  medium: 18,
  high: 32
};

function scoreFindings(findings: Finding[]) {
  const penalty = findings.reduce((sum, finding) => sum + severityWeight[finding.severity], 0);
  return Math.max(0, Math.min(100, 100 - penalty));
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
    `${text.riskLevel}: ${riskLevelLabel(result.riskLevel, language)}`,
    "",
    text.findings
  ];

  result.findings.forEach((finding, index) => {
    lines.push("");
    lines.push(`${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
    lines.push(`${text.description}: ${finding.description}`);
    lines.push(`${text.recommendation}: ${finding.recommendation}`);
  });

  return lines.join("\n");
}
