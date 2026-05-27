import { create } from "zustand";

type Theme = "light" | "dark";

interface UiState {
  theme: Theme;
  toggleTheme: () => void;
}

const savedTheme = (localStorage.getItem("skillsync_theme") as Theme | null) ?? "dark";

export const uiStore = create<UiState>((set, get) => ({
  theme: savedTheme,
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("skillsync_theme", next);
    set({ theme: next });
  }
}));
