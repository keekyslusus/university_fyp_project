import { GoogleGenAI } from "@google/genai";
import { createAiCacheKey, readAiCache, writeAiCache } from "./aiCache";
import { GEMINI_MODEL, getGeminiApiKey } from "./aiConfig";
import { buildAiPrompt } from "./aiPrompt";
import { normalizeAiAnalysis, parseAiResponse } from "./aiResponse";
import type { AiAnalysis, AnalysisResult } from "./types";

interface GeminiError extends Error {
  status?: number;
  response?: unknown;
  error?: unknown;
}

export async function analyzeWithGemini(
  fileName: string,
  configContent: string,
  localAnalysis: AnalysisResult
): Promise<AiAnalysis> {
  const cache = await createAiCacheKey(configContent);
  const cached = readAiCache(cache.key);

  if (cached) {
    console.info("[Scandium Gemini] cache hit", {
      fileName,
      model: GEMINI_MODEL,
      hash: cache.hash
    });

    return {
      ...normalizeAiAnalysis(cached),
      cached: true
    };
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn("[Scandium Gemini] missing API key", {
      fileName,
      model: GEMINI_MODEL,
      hash: cache.hash
    });
    throw new Error("Добавьте Gemini API key, чтобы включить анализ от ИИ.");
  }

  const responseText = await requestGeminiAnalysis(apiKey, fileName, configContent, localAnalysis, cache.hash);
  const parsed = parseAiResponse(responseText);

  if (parsed.parseError) {
    console.warn("[Scandium Gemini SDK] JSON parse failed", {
      fileName,
      model: GEMINI_MODEL,
      hash: cache.hash,
      responseText,
      error: parsed.parseError
    });
  }

  writeAiCache(cache.key, parsed.analysis);
  console.info("[Scandium Gemini SDK] response cached", {
    fileName,
    model: GEMINI_MODEL,
    hash: cache.hash
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
  hash: string
) {
  const ai = new GoogleGenAI({ apiKey });
  const requestStartedAt = Date.now();

  console.info("[Scandium Gemini SDK] request started", {
    fileName,
    model: GEMINI_MODEL,
    hash
  });

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildAiPrompt(fileName, configContent, localAnalysis),
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
      durationMs: Date.now() - requestStartedAt,
      usageMetadata: response.usageMetadata
    });

    if (!response.text) {
      console.error("[Scandium Gemini SDK] missing text response", {
        fileName,
        model: GEMINI_MODEL,
        hash
      });
      throw new Error("Gemini SDK не вернул текстовый ответ.");
    }

    return response.text;
  } catch (caught) {
    const error = caught as GeminiError;
    console.error("[Scandium Gemini SDK] request failed", {
      fileName,
      model: GEMINI_MODEL,
      hash,
      durationMs: Date.now() - requestStartedAt,
      name: error.name,
      message: error.message,
      status: error.status,
      response: error.response,
      error: error.error
    });

    const status = error.status ? ` ${error.status}` : "";
    throw new Error(`Gemini SDK вернул ошибку${status}: ${error.message}`);
  }
}
