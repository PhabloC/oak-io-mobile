export const colors = {
  canvas: "#F4F2FA",
  surface: "#FFFFFF",
  ink: "#1C1B29",
  muted: "#8B8798",
  accent: "#6E56F0",
  accentDeep: "#5536DC",
  accentSoft: "#EFE9FF",
  onAccent: "#FFFFFF",
  success: "#169968",
  danger: "#E2556A",
  warning: "#D9922A",
  info: "#3B82F6",
  line: "#EEEAF6",
};

export const radius = {
  sm: 16,
  md: 22,
  lg: 28,
  sheet: 32,
  pill: 999,
};

export const shadow = {
  card: [{ offsetX: 0, offsetY: 8, blurRadius: 20, color: "rgba(80, 60, 140, 0.08)" }],
  float: [{ offsetX: 0, offsetY: 12, blurRadius: 28, color: "rgba(70, 50, 130, 0.18)" }],
};

export const headerGradient = ["#7C5CFF", "#6846F0", "#5536DC"];

export function toneColor(type) {
  if (type === "Gasto") return colors.danger;
  if (type === "Investimento") return colors.info;
  return colors.success;
}
