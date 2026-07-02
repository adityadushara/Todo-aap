import { Platform } from "react-native";

export const colors = {
  primary: "#6366F1",
  primaryLight: "#818CF8",
  primaryDark: "#4F46E5",
  primaryGlow: "rgba(99, 102, 241, 0.1)",
  secondary: "#A78BFA",
  accent: "#6366F1",
  success: "#22C55E",
  successLight: "#DCFCE7",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  info: "#3B82F6",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  divider: "#F1F5F9",
  text: "#0F172A",
  textSecondary: "#64748B",
  textTertiary: "#94A3B8",
  textInverse: "#FFFFFF",
  tabBar: "rgba(255, 255, 255, 0.95)",
  tabBarBorder: "rgba(226, 232, 240, 0.8)",
  skeleton: "#E2E8F0",
  skeletonHighlight: "#F1F5F9",
  overlay: "rgba(15, 23, 42, 0.4)",
  heroStart: "#6366F1",
  heroEnd: "#818CF8",
  cardShadow: "rgba(15, 23, 42, 0.05)",
  glassBg: "rgba(255, 255, 255, 0.85)",
  glassBorder: "rgba(255, 255, 255, 0.4)",
  statBg1: "#EEF2FF",
  statBg2: "#F0FDF4",
  statBg3: "#FFFBEB",
  statBg4: "#FEF2F2",
  star: "#F59E0B",
  streak: "#EF4444",
  chartBar: "#6366F1",
  chartBg: "#EEF2FF",
};

export const typography = {
  largeTitle: {
    fontSize: 34, lineHeight: 40, fontWeight: "700" as const, letterSpacing: -0.5,
    fontFamily: Platform.select({ ios: "SF Pro Display", default: undefined }),
  },
  title1: {
    fontSize: 26, lineHeight: 32, fontWeight: "700" as const, letterSpacing: -0.4,
    fontFamily: Platform.select({ ios: "SF Pro Display", default: undefined }),
  },
  title2: {
    fontSize: 22, lineHeight: 28, fontWeight: "700" as const, letterSpacing: -0.3,
    fontFamily: Platform.select({ ios: "SF Pro Display", default: undefined }),
  },
  title3: {
    fontSize: 18, lineHeight: 24, fontWeight: "600" as const, letterSpacing: -0.2,
    fontFamily: Platform.select({ ios: "SF Pro Display", default: undefined }),
  },
  headline: {
    fontSize: 16, lineHeight: 22, fontWeight: "600" as const, letterSpacing: -0.2,
    fontFamily: Platform.select({ ios: "SF Pro Text", default: undefined }),
  },
  body: {
    fontSize: 15, lineHeight: 22, fontWeight: "400" as const, letterSpacing: -0.1,
    fontFamily: Platform.select({ ios: "SF Pro Text", default: undefined }),
  },
  callout: {
    fontSize: 14, lineHeight: 20, fontWeight: "400" as const, letterSpacing: -0.1,
    fontFamily: Platform.select({ ios: "SF Pro Text", default: undefined }),
  },
  subhead: {
    fontSize: 13, lineHeight: 18, fontWeight: "500" as const, letterSpacing: -0.1,
    fontFamily: Platform.select({ ios: "SF Pro Text", default: undefined }),
  },
  caption1: {
    fontSize: 12, lineHeight: 16, fontWeight: "400" as const, letterSpacing: 0,
    fontFamily: Platform.select({ ios: "SF Pro Text", default: undefined }),
  },
  caption2: {
    fontSize: 11, lineHeight: 14, fontWeight: "500" as const, letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: "SF Pro Text", default: undefined }),
  },
  label: {
    fontSize: 10, lineHeight: 12, fontWeight: "700" as const, letterSpacing: 0.8,
    fontFamily: Platform.select({ ios: "SF Pro Text", default: undefined }),
  },
  heroGreeting: {
    fontSize: 30, lineHeight: 36, fontWeight: "700" as const, letterSpacing: -0.5,
    fontFamily: Platform.select({ ios: "SF Pro Display", default: undefined }),
  },
  heroDate: {
    fontSize: 14, lineHeight: 18, fontWeight: "400" as const, letterSpacing: -0.1,
    fontFamily: Platform.select({ ios: "SF Pro Text", default: undefined }),
  },
  statValue: {
    fontSize: 24, lineHeight: 30, fontWeight: "700" as const, letterSpacing: -0.3,
    fontFamily: Platform.select({ ios: "SF Pro Display", default: undefined }),
  },
  statLabel: {
    fontSize: 11, lineHeight: 14, fontWeight: "500" as const, letterSpacing: 0,
    fontFamily: Platform.select({ ios: "SF Pro Text", default: undefined }),
  },
  quote: {
    fontSize: 13, lineHeight: 18, fontWeight: "400" as const, fontStyle: "italic" as const,
    fontFamily: Platform.select({ ios: "SF Pro Text", default: undefined }),
  },
};

export const spacing = {
  xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32,
  "2xl": 40, "3xl": 48, "4xl": 56, "5xl": 64, "6xl": 80, "7xl": 96,
};

export const borderRadius = {
  sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, "3xl": 28, "4xl": 32, full: 9999,
};

export function shadow(elevation: number) {
  const native: Record<number, object> = {
    1: { shadowColor: "#0F172A", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    2: { shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
    3: { shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
    4: { shadowColor: "#0F172A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8 },
  };
  const web: Record<number, object> = {
    1: { boxShadow: "0 1px 2px rgba(15,23,42,0.05)" },
    2: { boxShadow: "0 2px 6px rgba(15,23,42,0.06)" },
    3: { boxShadow: "0 4px 12px rgba(15,23,42,0.08)" },
    4: { boxShadow: "0 8px 20px rgba(15,23,42,0.1)" },
  };
  return Platform.select({
    web: web[elevation] || web[2],
    default: native[elevation] || native[2],
  });
}

export const priorityColors: Record<string, string> = {
  low: "#22C55E", medium: "#F59E0B", high: "#EF4444", urgent: "#DC2626",
};

export const categoryColors = [
  "#6366F1", "#22C55E", "#F59E0B", "#3B82F6",
  "#A78BFA", "#EC4899", "#14B8A6", "#F97316",
];

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", emoji: "🌅" };
  if (hour < 18) return { text: "Good afternoon", emoji: "☀️" };
  return { text: "Good evening", emoji: "🌙" };
}

export function randomQuote() {
  const quotes = [
    "Productivity is being able to do things that you were never able to do before.",
    "Focus on being productive instead of busy.",
    "The secret of getting ahead is getting started.",
    "Done is better than perfect."
  ];
  return { text: quotes[Math.floor(Math.random() * quotes.length)] };
}
