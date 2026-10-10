import type { ReactNode } from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export type UiIconName =
  | "home"
  | "circle-dollar"
  | "target"
  | "user"
  | "plus"
  | "trending-up"
  | "trending-down"
  | "bell"
  | "bell-off"
  | "eye"
  | "eye-off"
  | "settings"
  | "chevron-left"
  | "chevron-right"
  | "log-out"
  | "sun"
  | "moon"
  | "monitor"
  | "check"
  | "x"
  | "trophy"
  | "calendar"
  | "circle-alert"
  | "wallet";

export type UiIconProps = {
  color?: string;
  size?: number;
  strokeWidth?: number;
};

type GlyphProps = {
  color: string;
  strokeWidth: number;
};

const ICONS: Record<UiIconName, (props: GlyphProps) => ReactNode> = {
  home: ({ color, strokeWidth }) => (
    <>
      <Rect x="3" y="3" width="7" height="9" rx="1.5" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Rect x="14" y="3" width="7" height="5" rx="1.5" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Rect x="14" y="12" width="7" height="9" rx="1.5" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Rect x="3" y="16" width="7" height="5" rx="1.5" stroke={color} strokeWidth={strokeWidth} fill="none" />
    </>
  ),
  "circle-dollar": ({ color, strokeWidth }) => (
    <>
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M14.5 9.5c-.6-1-1.6-1.5-2.7-1.5-1.8 0-3 1.2-3 2.7 0 2.6 5.5 1.4 5.5 4.2 0 1.4-1.2 2.6-3 2.6-1.2 0-2.2-.5-2.8-1.5"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M12 6.5v1.5M12 16v1.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </>
  ),
  target: ({ color, strokeWidth }) => (
    <>
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
    </>
  ),
  user: ({ color, strokeWidth }) => (
    <>
      <Circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M5.5 19.5c1.2-3.2 3.5-4.8 6.5-4.8s5.3 1.6 6.5 4.8"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  plus: ({ color, strokeWidth }) => (
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  ),
  "trending-up": ({ color, strokeWidth }) => (
    <>
      <Path
        d="M3 17l6-6 4 4 8-8"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 7h7v7"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  "trending-down": ({ color, strokeWidth }) => (
    <>
      <Path
        d="M3 7l6 6 4-4 8 8"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 17h7v-7"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  bell: ({ color, strokeWidth }) => (
    <>
      <Path
        d="M6 9a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 20a2 2 0 0 0 4 0"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  "bell-off": ({ color, strokeWidth }) => (
    <>
      <Path
        d="M6.5 9.5a5.5 5.5 0 0 1 9.8-3.4M18 9c0 7 3 9 3 9H8"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 20a2 2 0 0 0 4 0"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M3 3l18 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </>
  ),
  eye: ({ color, strokeWidth }) => (
    <>
      <Path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
    </>
  ),
  "eye-off": ({ color, strokeWidth }) => (
    <>
      <Path
        d="M10.6 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.1 6.1C3.7 7.8 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M3 3l18 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </>
  ),
  settings: ({ color, strokeWidth }) => (
    <>
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M19.4 12a7.4 7.4 0 0 0-.1-1l2-1.5-2-3.5-2.3.8a7.5 7.5 0 0 0-1.7-1l-.4-2.4h-4l-.4 2.4a7.5 7.5 0 0 0-1.7 1l-2.3-.8-2 3.5 2 1.5a7.4 7.4 0 0 0 0 2l-2 1.5 2 3.5 2.3-.8a7.5 7.5 0 0 0 1.7 1l.4 2.4h4l.4-2.4a7.5 7.5 0 0 0 1.7-1l2.3.8 2-3.5-2-1.5c.1-.3.1-.7.1-1z"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinejoin="round"
      />
    </>
  ),
  "chevron-left": ({ color, strokeWidth }) => (
    <Path
      d="M15 6l-6 6 6 6"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "chevron-right": ({ color, strokeWidth }) => (
    <Path
      d="M9 6l6 6-6 6"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "log-out": ({ color, strokeWidth }) => (
    <>
      <Path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 17l5-5-5-5M21 12H9"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  sun: ({ color, strokeWidth }) => (
    <>
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </>
  ),
  moon: ({ color, strokeWidth }) => (
    <Path
      d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinejoin="round"
    />
  ),
  monitor: ({ color, strokeWidth }) => (
    <>
      <Rect
        x="2"
        y="3"
        width="20"
        height="14"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Path d="M8 21h8M12 17v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </>
  ),
  check: ({ color, strokeWidth }) => (
    <Path
      d="M5 12l5 5L20 7"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  x: ({ color, strokeWidth }) => (
    <Path
      d="M6 6l12 12M18 6L6 18"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
    />
  ),
  trophy: ({ color, strokeWidth }) => (
    <>
      <Path
        d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 6H5a3 3 0 0 0 3 3M17 6h2a3 3 0 0 1-3 3"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  calendar: ({ color, strokeWidth }) => (
    <>
      <Rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Path
        d="M16 3v4M8 3v4M3 11h18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </>
  ),
  "circle-alert": ({ color, strokeWidth }) => (
    <>
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path d="M12 8v5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="12" cy="16.5" r="1" fill={color} />
    </>
  ),
  wallet: ({ color, strokeWidth }) => (
    <>
      <Path
        d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <Rect
        x="2"
        y="8"
        width="20"
        height="12"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Path
        d="M16 14h4a1 1 0 0 0 0-2h-4a1 1 0 0 0 0 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
    </>
  ),
};

export function UiIcon({
  name,
  color = "#64748B",
  size = 24,
  strokeWidth = 2,
}: UiIconProps & { name: UiIconName }) {
  const Glyph = ICONS[name];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {Glyph({ color, strokeWidth })}
    </Svg>
  );
}

function makeUiIcon(name: UiIconName) {
  function Icon({ color = "#64748B", size = 24, strokeWidth = 2 }: UiIconProps) {
    return <UiIcon name={name} color={color} size={size} strokeWidth={strokeWidth} />;
  }
  Icon.displayName = `UiIcon(${name})`;
  return Icon;
}

export const HomeIcon = makeUiIcon("home");
export const CircleDollarIcon = makeUiIcon("circle-dollar");
export const TargetIcon = makeUiIcon("target");
export const UserIcon = makeUiIcon("user");
export const PlusIcon = makeUiIcon("plus");
export const TrendingUpIcon = makeUiIcon("trending-up");
export const TrendingDownIcon = makeUiIcon("trending-down");
export const BellIcon = makeUiIcon("bell");
export const BellOffIcon = makeUiIcon("bell-off");
export const EyeIcon = makeUiIcon("eye");
export const EyeOffIcon = makeUiIcon("eye-off");
export const SettingsIcon = makeUiIcon("settings");
export const ChevronLeftIcon = makeUiIcon("chevron-left");
export const ChevronRightIcon = makeUiIcon("chevron-right");
export const LogOutIcon = makeUiIcon("log-out");
export const SunIcon = makeUiIcon("sun");
export const MoonIcon = makeUiIcon("moon");
export const MonitorIcon = makeUiIcon("monitor");
export const CheckIcon = makeUiIcon("check");
export const XIcon = makeUiIcon("x");
export const TrophyIcon = makeUiIcon("trophy");
export const CalendarIcon = makeUiIcon("calendar");
export const CircleAlertIcon = makeUiIcon("circle-alert");
export const WalletIcon = makeUiIcon("wallet");
