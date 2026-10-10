import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

/** Tokens HSL alinhados ao brand OakIo (roxo fintech). */
export const THEME = {
  light: {
    background: "hsl(255 44% 96%)",
    foreground: "hsl(245 20% 13%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(245 20% 13%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(245 20% 13%)",
    primary: "hsl(249 83% 64%)",
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(255 60% 95%)",
    secondaryForeground: "hsl(249 83% 40%)",
    muted: "hsl(255 30% 94%)",
    mutedForeground: "hsl(255 7% 56%)",
    accent: "hsl(255 60% 95%)",
    accentForeground: "hsl(249 83% 40%)",
    destructive: "hsl(351 70% 61%)",
    border: "hsl(255 30% 92%)",
    input: "hsl(255 30% 92%)",
    ring: "hsl(249 83% 64%)",
    radius: "0.875rem",
  },
  dark: {
    background: "hsl(255 24% 8%)",
    foreground: "hsl(255 44% 96%)",
    card: "hsl(255 22% 13%)",
    cardForeground: "hsl(255 44% 96%)",
    popover: "hsl(255 22% 13%)",
    popoverForeground: "hsl(255 44% 96%)",
    primary: "hsl(249 100% 73%)",
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(255 25% 18%)",
    secondaryForeground: "hsl(255 44% 96%)",
    muted: "hsl(255 20% 16%)",
    mutedForeground: "hsl(255 10% 63%)",
    accent: "hsl(255 25% 18%)",
    accentForeground: "hsl(255 44% 96%)",
    destructive: "hsl(351 60% 55%)",
    border: "hsl(255 18% 20%)",
    input: "hsl(255 18% 20%)",
    ring: "hsl(249 100% 73%)",
    radius: "0.875rem",
  },
} as const;

export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      // Usa o mesmo tom do canvas para evitar flash branco nas trocas de tela.
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.background,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.background,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
