"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
};

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "eWarranty-theme";
const THEME_TRANSITION_DURATION_MS = 220;

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}

export default function ThemeProvider({
  children,
}: Props) {
  const transitionTimeoutRef = useRef<number | null>(null);

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    return getSystemTheme();
  });

  const applyThemeWithTransition = useCallback((nextTheme: ThemeMode) => {
    const root = document.documentElement;
    root.classList.add("theme-animating");

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove("theme-animating");
      transitionTimeoutRef.current = null;
    }, THEME_TRANSITION_DURATION_MS);

    const updateThemeState = () => {
      setThemeState(nextTheme);
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    };

    const documentWithViewTransition = document as DocumentWithViewTransition;

    if (typeof documentWithViewTransition.startViewTransition === "function") {
      documentWithViewTransition.startViewTransition(updateThemeState);
      return;
    }

    updateThemeState();
  }, []);

  useEffect(() => {
    applyTheme(theme);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (window.localStorage.getItem(THEME_STORAGE_KEY)) {
        return;
      }

      const nextTheme = mediaQuery.matches ? "dark" : "light";
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }

      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("theme-animating");
      }
    };
  }, []);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    applyThemeWithTransition(nextTheme);
  }, [applyThemeWithTransition]);

  const toggleTheme = useCallback(() => {
    const nextTheme = (theme === "dark" ? "light" : "dark") as ThemeMode;
    applyThemeWithTransition(nextTheme);
  }, [applyThemeWithTransition, theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    resolvedTheme: theme,
    setTheme,
    toggleTheme,
  }), [setTheme, theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}