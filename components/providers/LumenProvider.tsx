"use client";

import { ThemeProvider } from "@khamudom/lumen-ui-react";
import "@khamudom/lumen-ui-react/styles.css";

export function LumenProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" enableGlobalTheme={false}>
      {children}
    </ThemeProvider>
  );
}
