import type { AnalysisResult } from "./types";
import { MAX_CONFIG_CHARS } from "./aiConfig";

function riskLevelRu(level: AnalysisResult["riskLevel"]) {
  switch (level) {
    case "low":
      return "низкий";
    case "medium":
      return "средний";
    case "high":
      return "высокий";
  }
}

export function buildAiPrompt(fileName: string, configContent: string, localAnalysis: AnalysisResult) {
  const findings = localAnalysis.findings
    .map((finding) => `- ${finding.severity}: ${finding.title}. ${finding.description}`)
    .join("\n");

  return `Ты эксперт по безопасности VPN. Проанализируй конфигурацию и результаты локальных правил Scandium.

Верни только валидный JSON без markdown:
{
  "shortText": "краткий вывод на русском до 220 символов",
  "summary": "1-2 предложения общего вывода",
  "risks": ["короткий риск 1", "короткий риск 2", "короткий риск 3"],
  "actions": ["конкретное действие 1", "конкретное действие 2", "конкретное действие 3"],
  "conclusion": "итоговый вывод одним предложением",
  "details": "тот же смысл связным текстом на русском 700-1000 символов"
}

Не пиши эссе. Не придумывай факты, если параметра нет в конфиге. В risks и actions пиши без нумерации, по 3-5 пунктов максимум.

Файл: ${fileName}
Тип: ${localAnalysis.type}
Оценка Scandium: ${localAnalysis.score}/100
Уровень риска: ${riskLevelRu(localAnalysis.riskLevel)}

Локальные замечания:
${findings}

Конфигурация:
${configContent.slice(0, MAX_CONFIG_CHARS)}`;
}
