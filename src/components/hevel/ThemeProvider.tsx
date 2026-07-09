import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeScheme = "gruvbox-dark" | "gruvbox-light" | "nord" | "tokyo-night" | "solarized-dark" | "catppuccin" | "rhubarb" | "red-cabbage";

const SCHEME_META: Record<ThemeScheme, { label: string; colors: string[] }> = {
  "gruvbox-dark":    { label: "gruvbox dark",    colors: ["#282828", "#3c3836", "#ebdbb2", "#d79921", "#689d6a"] },
  "gruvbox-light":   { label: "gruvbox light",   colors: ["#fbf1c7", "#ebdbb2", "#3c3836", "#d79921", "#689d6a"] },
  "nord":            { label: "nord",             colors: ["#2e3440", "#4c566a", "#d8dee9", "#81a1c1", "#88c0d0"] },
  "tokyo-night":     { label: "tokyo night",      colors: ["#1a1b26", "#414868", "#a9b1d6", "#7aa2f7", "#bb9af7"] },
  "solarized-dark":  { label: "solarized dark",   colors: ["#002b36", "#073642", "#839496", "#b58900", "#2aa198"] },
  "catppuccin":      { label: "catppuccin",        colors: ["#1e1e2e", "#45475a", "#cdd6f4", "#cba6f7", "#94e2d5"] },
  "rhubarb":         { label: "rhubarb",           colors: ["#1a0e0c", "#2e1a17", "#f2e3d0", "#d8395a", "#9fb89a"] },
  "red-cabbage":     { label: "red cabbage",       colors: ["#15101a", "#2a1f36", "#e6dcf0", "#b13bb8", "#6fa067"] },
};

export const ALL_SCHEMES = Object.entries(SCHEME_META) as [ThemeScheme, { label: string; colors: string[] }][];

const ThemeContext = createContext<{
  scheme: ThemeScheme;
  setScheme: (s: ThemeScheme) => void;
}>({ scheme: "gruvbox-dark", setScheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scheme, setScheme] = useState<ThemeScheme>("gruvbox-dark");

  useEffect(() => {
    const el = document.documentElement;
    // Remove all scheme classes; :root already carries gruvbox-dark by default.
    ALL_SCHEMES.forEach(([s]) => el.classList.remove(s));
    if (scheme !== "gruvbox-dark") {
      el.classList.add(scheme);
    }
  }, [scheme]);


  return (
    <ThemeContext.Provider value={{ scheme, setScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
