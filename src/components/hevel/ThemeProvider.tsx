import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeScheme = "gruvbox-dark" | "gruvbox-light" | "nord" | "tokyo-night" | "solarized-dark" | "catppuccin";

const SCHEME_LABELS: Record<ThemeScheme, string> = {
  "gruvbox-dark": "gruvbox dark",
  "gruvbox-light": "gruvbox light",
  "nord": "nord",
  "tokyo-night": "tokyo night",
  "solarized-dark": "solarized dark",
  "catppuccin": "catppuccin",
};

export const ALL_SCHEMES = Object.entries(SCHEME_LABELS) as [ThemeScheme, string][];

const ThemeContext = createContext<{
  scheme: ThemeScheme;
  setScheme: (s: ThemeScheme) => void;
}>({ scheme: "gruvbox-dark", setScheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scheme, setScheme] = useState<ThemeScheme>("gruvbox-dark");

  useEffect(() => {
    const el = document.documentElement;
    // Remove all scheme classes
    ALL_SCHEMES.forEach(([s]) => el.classList.remove(s));
    el.classList.add(scheme);
    // Toggle dark class for tailwind
    const isDark = scheme !== "gruvbox-light";
    el.classList.toggle("dark", isDark);
  }, [scheme]);

  return (
    <ThemeContext.Provider value={{ scheme, setScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
