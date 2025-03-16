"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { ReactNode, useEffect } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Force dark mode on mount
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <NextThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
      {children}
    </NextThemeProvider>
  );
} 