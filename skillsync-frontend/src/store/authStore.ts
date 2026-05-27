import { create } from "zustand";
import { Profile, Tokens } from "../types";
import { clearTokens, readTokens, writeTokens } from "../utils/token";

interface AuthState {
  user: Profile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: Profile | null) => void;
  setTokens: (tokens: Tokens) => void;
  logout: () => void;
  bootstrap: () => void;
}

export const authStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setUser: (user) => set({ user }),
  setTokens: (tokens) => {
    writeTokens(tokens);
    set({ accessToken: tokens.access, refreshToken: tokens.refresh, isAuthenticated: true });
  },
  logout: () => {
    clearTokens();
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
  bootstrap: () => {
    const tokens = readTokens();
    if (!tokens) return;
    set({ accessToken: tokens.access, refreshToken: tokens.refresh, isAuthenticated: true });
  }
}));
