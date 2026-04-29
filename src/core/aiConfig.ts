export const GEMINI_MODEL = "gemini-2.5-flash";
export const MAX_CONFIG_CHARS = 14000;
export const AI_CACHE_VERSION = "v3";

const API_KEY_STORAGE_KEY = "scandium.geminiApiKey";

export function getGeminiApiKey() {
  return localStorage.getItem(API_KEY_STORAGE_KEY)?.trim()
    || import.meta.env.VITE_GEMINI_API_KEY?.trim()
    || "";
}

export function hasGeminiApiKey() {
  return Boolean(getGeminiApiKey());
}

export function saveGeminiApiKey(apiKey: string) {
  const trimmed = apiKey.trim();

  if (trimmed) {
    localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}
