import type { ReactNode } from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

const COLORS = {
  salario: "#16A34A",
  freelance: "#0D9488",
  investimentos: "#3B82F6",
  presente: "#DB2777",
  venda: "#D97706",
  alimentacao: "#E11D48",
  transporte: "#0284C7",
  saude: "#DC2626",
  educacao: "#4F46E5",
  lazer: "#7C3AED",
  moradia: "#B45309",
  roupas: "#E11D8C",
  tecnologia: "#475569",
  contas: "#6D28D9",
  cdb: "#15803D",
  tesouro: "#CA8A04",
  acoes: "#2563EB",
  fiis: "#0891B2",
  criptomoedas: "#F7931A",
  bitcoin: "#F7931A",
  btc: "#F7931A",
  poupanca: "#EC4899",
  outros: "#64748B",
  ganho: "#169968",
  gasto: "#E2556A",
} as const;

export type CategoryIconName = keyof typeof COLORS;

export type CategoryIconSvgProps = {
  name?: string;
  size?: number;
};

function Frame({
  color,
  size,
  children,
}: {
  color: string;
  size: number;
  children: ReactNode;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect x="0" y="0" width="64" height="64" rx="18" fill={color} />
      {children}
    </Svg>
  );
}

const GLYPHS: Record<string, ReactNode> = {
  salario: (
    <>
      <Path d="M18 28h28v18a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V28z" fill="#fff" />
      <Path
        d="M24 28v-4a8 8 0 0 1 16 0v4"
        stroke="#fff"
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
      />
      <Rect x="29" y="34" width="6" height="5" rx="1.5" fill={COLORS.salario} />
    </>
  ),
  freelance: (
    <>
      <Path
        d="M14 20h36a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V23a3 3 0 0 1 3-3z"
        fill="#fff"
      />
      <Path d="M24 48h16" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <Path d="M28 44h8v4h-8z" fill="#fff" />
      <Rect x="17" y="25" width="30" height="14" rx="2" fill={COLORS.freelance} />
    </>
  ),
  investimentos: (
    <>
      <Path
        d="M16 42 L28 30 L38 36 L50 20"
        stroke="#fff"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M40 20h10v10"
        stroke="#fff"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  presente: (
    <>
      <Rect x="15" y="28" width="34" height="22" rx="3" fill="#fff" />
      <Rect x="14" y="22" width="36" height="8" rx="2" fill="#fff" />
      <Path d="M32 22v28" stroke={COLORS.presente} strokeWidth="3.2" />
      <Path
        d="M24 22c0-5 4-8 8-8s8 3 8 8"
        stroke="#fff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  venda: (
    <>
      <Path d="M22 20h20l3 8H19l3-8z" fill="#fff" />
      <Path
        d="M19 28h26l-2 22a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3l-2-22z"
        fill="#fff"
      />
      <Path d="M28 36v8M36 36v8" stroke={COLORS.venda} strokeWidth="2.8" strokeLinecap="round" />
    </>
  ),
  alimentacao: (
    <>
      <Path
        d="M22 16v20c0 3 2 5 5 5h1V16"
        stroke="#fff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M20 16h10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <Path d="M22 22h8M22 28h8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <Path
        d="M40 16c4 0 7 4 7 10v5h-4v17"
        stroke="#fff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  transporte: (
    <>
      <Path d="M14 30c2-8 6-12 18-12s16 4 18 12l2 10H12l2-10z" fill="#fff" />
      <Path
        d="M12 40h40v4a3 3 0 0 1-3 3h-3v-2H18v2h-3a3 3 0 0 1-3-3v-4z"
        fill="#fff"
      />
      <Circle cx="20" cy="44" r="3.5" fill={COLORS.transporte} />
      <Circle cx="44" cy="44" r="3.5" fill={COLORS.transporte} />
      <Path
        d="M22 28h8M36 28h6"
        stroke={COLORS.transporte}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </>
  ),
  saude: (
    <>
      <Path
        d="M32 48s-14-9-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 20-14 20z"
        fill="#fff"
      />
      <Path d="M32 26v12M26 32h12" stroke={COLORS.saude} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  educacao: (
    <>
      <Path d="M8 28 L32 16 L56 28 L32 40 Z" fill="#fff" />
      <Path
        d="M18 33v10c6 4 22 4 28 0V33"
        stroke="#fff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M52 28v14" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  lazer: (
    <>
      <Path
        d="M16 26h32a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6V32a6 6 0 0 1 6-6z"
        fill="#fff"
      />
      <Circle cx="24" cy="37" r="3.2" fill={COLORS.lazer} />
      <Circle cx="40" cy="37" r="3.2" fill={COLORS.lazer} />
      <Path d="M30 34h4M30 40h4" stroke={COLORS.lazer} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  moradia: (
    <>
      <Path d="M12 30 L32 14 L52 30 V50 a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V30z" fill="#fff" />
      <Rect x="27" y="36" width="10" height="17" rx="1.5" fill={COLORS.moradia} />
    </>
  ),
  roupas: (
    <>
      <Path
        d="M22 18c3 4 7 5 10 5s7-1 10-5l8 4-4 8h-4v22H22V30h-4l-4-8 8-4z"
        fill="#fff"
      />
    </>
  ),
  tecnologia: (
    <>
      <Rect x="22" y="12" width="20" height="40" rx="4" fill="#fff" />
      <Rect x="25" y="17" width="14" height="26" rx="1.5" fill={COLORS.tecnologia} />
      <Circle cx="32" cy="47" r="1.8" fill={COLORS.tecnologia} />
    </>
  ),
  contas: (
    <>
      <Rect x="12" y="20" width="40" height="26" rx="4" fill="#fff" />
      <Rect x="12" y="26" width="40" height="7" fill={COLORS.contas} />
      <Rect x="18" y="38" width="14" height="3.5" rx="1.5" fill={COLORS.contas} />
      <Rect x="36" y="38" width="10" height="3.5" rx="1.5" fill={COLORS.contas} />
    </>
  ),
  cdb: (
    <>
      <Path d="M16 48V28h6v20H16zm13 0V22h6v26h-6zm13 0V30h6v18h-6z" fill="#fff" />
      <Path d="M14 48h36" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <Path d="M20 22h24l-4-6H24l-4 6z" fill="#fff" />
    </>
  ),
  tesouro: (
    <>
      <Path d="M32 14l12 6v10c0 10-7 16-12 18-5-2-12-8-12-18V20l12-6z" fill="#fff" />
      <Circle cx="32" cy="30" r="6" fill={COLORS.tesouro} />
      <Path d="M32 26v8M29 30h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  acoes: (
    <>
      <Path d="M16 44h6V28h-6v16zm13 0h6V20h-6v24zm13 0h6V32h-6v12z" fill="#fff" />
      <Path d="M14 48h38" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  fiis: (
    <>
      <Path d="M14 48V24l18-10 18 10v24H14z" fill="#fff" />
      <Rect x="22" y="30" width="6" height="6" fill={COLORS.fiis} />
      <Rect x="36" y="30" width="6" height="6" fill={COLORS.fiis} />
      <Rect x="22" y="40" width="6" height="8" fill={COLORS.fiis} />
      <Rect x="36" y="40" width="6" height="8" fill={COLORS.fiis} />
    </>
  ),
  criptomoedas: (
    <>
      <Path
        d="M30 14v6M36 14v6M30 44v6M36 44v6"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M26 22h12c3.3 0 6 2.5 6 5.5S41.3 33 38 33h-5c4 0 7.5 2.5 7.5 6S37 45 33 45H26V22z"
        fill="#fff"
      />
      <Path d="M31 22v23" stroke={COLORS.criptomoedas} strokeWidth="3" />
    </>
  ),
  poupanca: (
    <>
      <Path
        d="M40 28c0-8-6-14-14-14s-14 7-14 15c0 8 5 15 14 17v4h6v-4c4-1 8-4 10-8l5 2-2-7c1-1.5 1.5-3 1.5-5z"
        fill="#fff"
      />
      <Circle cx="30" cy="26" r="2" fill={COLORS.poupanca} />
      <Path
        d="M20 34c2 3 6 5 12 5"
        stroke={COLORS.poupanca}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  outros: (
    <>
      <Circle cx="24" cy="34" r="9" fill="#fff" />
      <Circle cx="40" cy="30" r="9" fill="#fff" />
      <Path
        d="M24 30v8M21 34h6M40 26v8M37 30h6"
        stroke={COLORS.outros}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </>
  ),
  ganho: (
    <>
      <Path
        d="M20 36 L32 22 L44 36"
        stroke="#fff"
        strokeWidth="3.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M32 24v22" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
    </>
  ),
  gasto: (
    <>
      <Path
        d="M20 28 L32 42 L44 28"
        stroke="#fff"
        strokeWidth="3.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M32 40V18" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
    </>
  ),
};

GLYPHS.bitcoin = GLYPHS.criptomoedas;
GLYPHS.btc = GLYPHS.criptomoedas;
GLYPHS["tesouro direto"] = GLYPHS.tesouro;

export function CategoryIconSvg({ name = "outros", size = 40 }: CategoryIconSvgProps) {
  const key = String(name || "outros");
  const color = COLORS[key as CategoryIconName] ?? COLORS.outros;
  const glyph = GLYPHS[key] ?? GLYPHS.outros;

  return (
    <Frame color={color} size={size}>
      {glyph}
    </Frame>
  );
}

export const CATEGORY_ICON_KEYS = Object.keys(COLORS) as CategoryIconName[];
