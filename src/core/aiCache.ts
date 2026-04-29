import { AI_CACHE_VERSION } from "./aiConfig";
import type { AiAnalysis } from "./types";

const CACHE_PREFIX = `scandium.aiAnalysis.${AI_CACHE_VERSION}.`;

async function sha256(content: string) {
  const data = new TextEncoder().encode(content);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAiCacheKey(content: string) {
  const hash = await sha256(content);
  return {
    hash,
    key: `${CACHE_PREFIX}${hash}`
  };
}

export function readAiCache(key: string) {
  const cached = localStorage.getItem(key);
  if (!cached) {
    return null;
  }

  return JSON.parse(cached) as Omit<AiAnalysis, "cached">;
}

export function writeAiCache(key: string, analysis: Omit<AiAnalysis, "cached">) {
  localStorage.setItem(key, JSON.stringify(analysis));
}
