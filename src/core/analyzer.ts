import { parseConfig } from "./parser";
import { analyzeOpenVpn, analyzeUnknown, analyzeWireGuard } from "./rules";
import type { AnalysisResult, Finding, Severity } from "./types";

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
    return "Низкий";
  }

  if (score >= 45) {
    return "Средний";
  }

  return "Высокий";
}

export function analyzeConfig(fileName: string, content: string): AnalysisResult {
  const parsed = parseConfig(content);
  const findings = parsed.type === "openvpn"
    ? analyzeOpenVpn(parsed)
    : parsed.type === "wireguard"
      ? analyzeWireGuard(parsed)
      : analyzeUnknown();
  const score = scoreFindings(findings);
  const level = riskLevel(score);

  return {
    fileName,
    type: parsed.type,
    score,
    riskLevel: level,
    findings,
    summary: `Файл ${fileName} распознан как ${parsed.type}. Итоговая оценка: ${score}/100. Уровень риска: ${level}.`
  };
}

export function formatReport(result: AnalysisResult) {
  const typeLabel = result.type === "openvpn"
    ? "OpenVPN"
    : result.type === "wireguard"
      ? "WireGuard"
      : "Не распознан";

  const lines = [
    "Scandium - отчёт анализа безопасности VPN-конфигурации",
    "",
    `Файл: ${result.fileName}`,
    `Тип: ${typeLabel}`,
    `Оценка: ${result.score}/100`,
    `Уровень риска: ${result.riskLevel}`,
    "",
    "Найденные замечания:"
  ];

  result.findings.forEach((finding, index) => {
    lines.push("");
    lines.push(`${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
    lines.push(`Описание: ${finding.description}`);
    lines.push(`Рекомендация: ${finding.recommendation}`);
  });

  return lines.join("\n");
}
