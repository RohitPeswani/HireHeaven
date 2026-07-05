"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Read persisted theme on mount
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || "system";
    setThemeState(saved);
    setMounted(true);
  }, []);

  // Apply theme to <html> element
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      root.classList.remove("light", "dark");
      if (theme === "system") {
        root.classList.add(mq.matches ? "dark" : "light");
      } else {
        root.classList.add(theme);
      }
    };

    apply();

    if (theme === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme, mounted]);

  const setTheme = (next: Theme) => {
    localStorage.setItem("theme", next);
    setThemeState(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

/** Toast container that syncs with active theme */
export function ThemeAwareToast() {
  const { theme } = useTheme();
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () =>
      setResolved(
        theme === "system" ? (mq.matches ? "dark" : "light") : theme === "dark" ? "dark" : "light"
      );
    resolve();
    mq.addEventListener("change", resolve);
    return () => mq.removeEventListener("change", resolve);
  }, [theme]);

  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme={resolved}
    />
  );
}
