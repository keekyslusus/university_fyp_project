import type { AiAnalysis } from "./types";
import type { Language } from "../i18n/dictionaries";

const fallbackText = {
  ru: {
    invalidJson: "Gemini вернул неполный или невалидный JSON-ответ. Повторите анализ.",
    emptyShort: "ИИ-анализ завершён, но ответ оказался пустым.",
    emptyDetails: "Gemini не вернул подробный вывод.",
    riskKeywords: ["риск", "уязвим", "отсутств", "слаб"],
    actionKeywords: ["рекоменду", "добав", "использ", "перейти", "внедр"]
  },
  en: {
    invalidJson: "Gemini returned an incomplete or invalid JSON response. Run the analysis again.",
    emptyShort: "AI analysis finished, but the response was empty.",
    emptyDetails: "Gemini did not return detailed output.",
    riskKeywords: ["risk", "vulnerab", "missing", "weak", "absent"],
    actionKeywords: ["recommend", "add", "use", "switch", "enable", "disable"]
  },
  kk: {
    invalidJson: "Gemini толық емес немесе жарамсыз JSON жауабын қайтарды. Талдауды қайта іске қосыңыз.",
    emptyShort: "ИИ талдауы аяқталды, бірақ жауап бос болды.",
    emptyDetails: "Gemini толық қорытынды қайтармады.",
    riskKeywords: ["тәуекел", "осал", "жоқ", "әлсіз", "көрсетілмеген"],
    actionKeywords: ["ұсыны", "қос", "қолдан", "ауыстыр", "тексер"]
  }
} as const;

function cleanJson(raw: string) {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export function normalizeAiAnalysis(value: unknown, language: Language): Omit<AiAnalysis, "cached"> {
  if (!value || typeof value !== "object") {
    throw new Error("Gemini returned an unexpected response format.");
  }

  const record = value as Record<string, unknown>;
  if (typeof record.shortText !== "string" || typeof record.details !== "string") {
    throw new Error("Gemini returned an unexpected response format.");
  }

  const details = record.details.trim().slice(0, 1400);

  return {
    shortText: record.shortText.trim().slice(0, 260),
    details,
    summary: stringField(record.summary, details),
    risks: listField(record.risks, details, fallbackText[language].riskKeywords),
    actions: listField(record.actions, details, fallbackText[language].actionKeywords),
    conclusion: stringField(record.conclusion, lastSentence(details))
  };
}

function fallbackFromText(text: string, language: Language): Omit<AiAnalysis, "cached"> {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized || normalized.startsWith("{")) {
    throw new Error(fallbackText[language].invalidJson);
  }

  return {
    shortText: normalized.slice(0, 240) || fallbackText[language].emptyShort,
    details: normalized.slice(0, 1400) || fallbackText[language].emptyDetails,
    summary: firstSentence(normalized),
    risks: extractSentences(normalized, fallbackText[language].riskKeywords).slice(0, 4),
    actions: extractSentences(normalized, fallbackText[language].actionKeywords).slice(0, 4),
    conclusion: lastSentence(normalized)
  };
}

export function parseAiResponse(responseText: string, language: Language) {
  try {
    return {
      analysis: normalizeAiAnalysis(JSON.parse(cleanJson(responseText)), language),
      parseError: null
    };
  } catch (caught) {
    return {
      analysis: fallbackFromText(responseText, language),
      parseError: caught
    };
  }
}

function stringField(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, 500)
    : fallback.slice(0, 500);
}

function listField(value: unknown, fallbackText: string, keywords: readonly string[]) {
  if (Array.isArray(value)) {
    const items = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (items.length > 0) {
      return items;
    }
  }

  return extractSentences(fallbackText, keywords).slice(0, 4);
}

function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function firstSentence(text: string) {
  return splitSentences(text)[0] ?? text.slice(0, 240);
}

function lastSentence(text: string) {
  const sentences = splitSentences(text);
  return sentences.at(-1) ?? text.slice(0, 240);
}

function extractSentences(text: string, keywords: readonly string[]) {
  const normalizedKeywords = keywords.map((keyword) => keyword.toLowerCase());
  return splitSentences(text)
    .filter((sentence) => normalizedKeywords.some((keyword) => sentence.toLowerCase().includes(keyword)))
    .map((sentence) => sentence.replace(/^(во-первых|во-вторых|в-третьих|наконец),?\s*/i, ""))
    .map((sentence) => sentence.replace(/^(first|second|third|finally),?\s*/i, ""))
    .map((sentence) => sentence.replace(/^рекомендуется\s+/i, ""))
    .map((sentence) => sentence.replace(/^it is recommended to\s+/i, ""))
    .map((sentence) => sentence.trim());
}
