import { GoogleGenAI } from "@google/genai";
import { createAiCacheKey, readAiCache, writeAiCache } from "./aiCache";
import { GEMINI_MODEL, getGeminiApiKey } from "./aiConfig";
import { buildAiPrompt } from "./aiPrompt";
import { normalizeAiAnalysis, parseAiResponse } from "./aiResponse";
import type { AiAnalysis, AnalysisResult } from "./types";
import type { Language } from "../i18n/dictionaries";

interface GeminiError extends Error {
  status?: number;
  response?: unknown;
  error?: unknown;
}

const aiErrorText = {
  ru: {
    missingKey: "Добавьте Gemini API key, чтобы включить анализ от ИИ.",
    emptyResponse: "Gemini SDK не вернул текстовый ответ.",
    sdkError: (status: string, message: string) => `Gemini SDK вернул ошибку${status}: ${message}`
  },
  en: {
    missingKey: "Add a Gemini API key to enable AI analysis.",
    emptyResponse: "Gemini SDK did not return a text response.",
    sdkError: (status: string, message: string) => `Gemini SDK returned an error${status}: ${message}`
  },
  kk: {
    missingKey: "ИИ талдауын қосу үшін Gemini API key қосыңыз.",
    emptyResponse: "Gemini SDK мәтіндік жауап қайтармады.",
    sdkError: (status: string, message: string) => `Gemini SDK қате қайтарды${status}: ${message}`
  }
} as const;

export async function analyzeWithGemini(
  fileName: string,
  configContent: string,
  localAnalysis: AnalysisResult,
  language: Language
): Promise<AiAnalysis> {
  const cache = await createAiCacheKey(configContent, language);
  const cached = readAiCache(cache.key);

  if (cached) {
    console.info("[Scandium Gemini] cache hit", {
      fileName,
      model: GEMINI_MODEL,
      hash: cache.hash,
      language
    });

    return {
      ...normalizeAiAnalysis(cached, language),
      cached: true
    };
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn("[Scandium Gemini] missing API key", {
      fileName,
      model: GEMINI_MODEL,
      hash: cache.hash,
      language
    });
    throw new Error(aiErrorText[language].missingKey);
  }

  const responseText = await requestGeminiAnalysis(apiKey, fileName, configContent, localAnalysis, language, cache.hash);
  const parsed = parseAiResponse(responseText, language);

  if (parsed.parseError) {
    console.warn("[Scandium Gemini SDK] JSON parse failed", {
      fileName,
      model: GEMINI_MODEL,
      hash: cache.hash,
      language,
      responseText,
      error: parsed.parseError
    });
  }

  writeAiCache(cache.key, parsed.analysis);
  console.info("[Scandium Gemini SDK] response cached", {
    fileName,
    model: GEMINI_MODEL,
    hash: cache.hash,
    language
  });

  return {
    ...parsed.analysis,
    cached: false
  };
}

async function requestGeminiAnalysis(
  apiKey: string,
  fileName: string,
  configContent: string,
  localAnalysis: AnalysisResult,
  language: Language,
  hash: string
) {
  const ai = new GoogleGenAI({ apiKey });
  const requestStartedAt = Date.now();

  console.info("[Scandium Gemini SDK] request started", {
    fileName,
    model: GEMINI_MODEL,
    language,
    hash
  });

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildAiPrompt(fileName, configContent, localAnalysis, language),
      config: {
        temperature: 0.2,
        maxOutputTokens: 1400,
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    });

    console.info("[Scandium Gemini SDK] request completed", {
      fileName,
      model: GEMINI_MODEL,
      hash,
      language,
      durationMs: Date.now() - requestStartedAt,
      usageMetadata: response.usageMetadata
    });

    if (!response.text) {
      console.error("[Scandium Gemini SDK] missing text response", {
        fileName,
        model: GEMINI_MODEL,
        language,
        hash
      });
      throw new Error(aiErrorText[language].emptyResponse);
    }

    return response.text;
  } catch (caught) {
    const error = caught as GeminiError;
    console.error("[Scandium Gemini SDK] request failed", {
      fileName,
      model: GEMINI_MODEL,
      hash,
      language,
      durationMs: Date.now() - requestStartedAt,
      name: error.name,
      message: error.message,
      status: error.status,
      response: error.response,
      error: error.error
    });

    const status = error.status ? ` ${error.status}` : "";
    throw new Error(aiErrorText[language].sdkError(status, error.message));
  }
}
