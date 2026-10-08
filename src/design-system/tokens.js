export const radius = {
  sm: 16,
  md: 22,
  lg: 28,
  sheet: 32,
  pill: 999,
};

const shared = {
  accent: "#6E56F0",
  accentDeep: "#5536DC",
  onAccent: "#FFFFFF",
  success: "#169968",
  danger: "#E2556A",
  warning: "#D9922A",
  info: "#3B82F6",
};

export const lightTheme = {
  scheme: "light",
  colors: {
    ...shared,
    canvas: "#F4F2FA",
    surface: "#FFFFFF",
    ink: "#1C1B29",
    muted: "#8B8798",
    accentSoft: "#EFE9FF",
    line: "#EEEAF6",
    tintSuccess: "#E7F8F0",
    tintDanger: "#FDECEE",
    tintInfo: "#E8F1FF",
    tintWarning: "#FFF1E8",
  },
  headerGradient: ["#7C5CFF", "#6846F0", "#5536DC"],
  shadow: {
    card: [{ offsetX: 0, offsetY: 8, blurRadius: 20, color: "rgba(80, 60, 140, 0.08)" }],
    float: [{ offsetX: 0, offsetY: 12, blurRadius: 28, color: "rgba(70, 50, 130, 0.18)" }],
  },
  statusBar: "dark",
};

export const darkTheme = {
  scheme: "dark",
  colors: {
    ...shared,
    accent: "#8B74FF",
    accentDeep: "#6E56F0",
    canvas: "#12101A",
    surface: "#1C1928",
    ink: "#F4F2FA",
    muted: "#9B96AB",
    accentSoft: "#2A2440",
    line: "#2C2838",
    tintSuccess: "#163528",
    tintDanger: "#3A1F28",
    tintInfo: "#1A2A40",
    tintWarning: "#3A2A18",
  },
  headerGradient: ["#6E56F0", "#5536DC", "#3D28A8"],
  shadow: {
    card: [{ offsetX: 0, offsetY: 8, blurRadius: 20, color: "rgba(0, 0, 0, 0.28)" }],
    float: [{ offsetX: 0, offsetY: 12, blurRadius: 28, color: "rgba(0, 0, 0, 0.4)" }],
  },
  statusBar: "light",
};

/** Fallback estático (tema claro) para imports legados. Prefira useTheme(). */
export const colors = lightTheme.colors;
export const shadow = lightTheme.shadow;
export const headerGradient = lightTheme.headerGradient;

export function getTheme(scheme) {
  return scheme === "dark" ? darkTheme : lightTheme;
}

export function toneColor(type, palette = colors) {
  if (type === "Gasto") return palette.danger;
  if (type === "Investimento") return palette.info;
  return palette.success;
}
