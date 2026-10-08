import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTheme } from "../design-system/tokens";

const STORAGE_KEY = "oakio.themePreference";
const ThemeContext = createContext(null);

export const THEME_OPTIONS = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "system", label: "Sistema" },
];

function resolveScheme(preference, systemScheme) {
  if (preference === "light" || preference === "dark") return preference;
  return systemScheme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const systemScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreferenceState] = useState("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!mounted) return;
        if (value === "light" || value === "dark" || value === "system") {
          setPreferenceState(value);
        }
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const scheme = resolveScheme(preference, systemScheme);
  const theme = useMemo(() => getTheme(scheme), [scheme]);

  useEffect(() => {
    // No Android, Appearance.setColorScheme(null) crasha — só NativeWind.
    // "system" segue o aparelho; light/dark forçam o esquema do NativeWind.
    try {
      setColorScheme(preference === "system" ? "system" : preference);
    } catch {
      // Algumas plataformas não suportam setColorScheme.
    }
  }, [preference, setColorScheme]);

  const setPreference = async (next) => {
    if (next !== "light" && next !== "dark" && next !== "system") return;
    setPreferenceState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(
    () => ({
      ready,
      preference,
      setPreference,
      scheme,
      isDark: scheme === "dark",
      colors: theme.colors,
      shadow: theme.shadow,
      headerGradient: theme.headerGradient,
      statusBar: theme.statusBar,
      toneColor: (type) => {
        if (type === "Gasto") return theme.colors.danger;
        if (type === "Investimento") return theme.colors.info;
        return theme.colors.success;
      },
    }),
    [ready, preference, scheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
}
