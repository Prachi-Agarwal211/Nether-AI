// src/core/ai-config.js

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || '';
const MODEL = process.env.GOOGLE_GEMINI_MODEL || 'gemini-1.5-flash';
const TIMEOUT_MS = Number(process.env.GOOGLE_GEMINI_TIMEOUT_MS || 30000);

export const AI_CONFIG = Object.freeze({
  apiKey: API_KEY,
  model: MODEL,
  endpointBase: 'https://generativelanguage.googleapis.com/v1beta',
  timeoutMs: TIMEOUT_MS,
});

export function ensureApiKey() {
  if (!AI_CONFIG.apiKey) {
    throw new Error('Missing GOOGLE_GEMINI_API_KEY environment variable.');
  }
  return true;
}

export function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-goog-api-key': AI_CONFIG.apiKey,
  };
}
