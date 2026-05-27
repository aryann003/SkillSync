import { Tokens } from "../types";

const TOKEN_KEY = "skillsync_tokens";

export const readTokens = (): Tokens | null => {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Tokens;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

export const writeTokens = (tokens: Tokens): void => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};
