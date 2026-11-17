import type { CSSProperties } from "react";
import type { SiteTheme } from "@/types/catalog";

const hexPattern = /^#[0-9a-fA-F]{6}$/;

export const defaultSiteTheme: SiteTheme = {
  background: "#f7f5ec",
  surface: "#fffdf7",
  surfaceSoft: "#e9efe1",
  ink: "#1f2d23",
  muted: "#626e60",
  primary: "#3e5a44",
  accent: "#c19a5b",
  border: "#dbe3d0",
  success: "#3f6e4e",
  warning: "#8f5f1f",
  danger: "#a24c42",
};

export const siteThemeKeys = [
  "background",
  "surface",
  "surfaceSoft",
  "ink",
  "muted",
  "primary",
  "accent",
  "border",
  "success",
  "warning",
  "danger",
] as const satisfies readonly (keyof SiteTheme)[];

export const siteThemeFieldNames: Record<keyof SiteTheme, string> = {
  background: "themeBackground",
  surface: "themeSurface",
  surfaceSoft: "themeSurfaceSoft",
  ink: "themeInk",
  muted: "themeMuted",
  primary: "themePrimary",
  accent: "themeAccent",
  border: "themeBorder",
  success: "themeSuccess",
  warning: "themeWarning",
  danger: "themeDanger",
};

function safeColor(value: unknown, fallback: string) {
  return typeof value === "string" && hexPattern.test(value) ? value : fallback;
}

export function normalizeSiteTheme(value: unknown): SiteTheme {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultSiteTheme;
  }

  const theme = value as Record<string, unknown>;
  return {
    background: safeColor(theme.background, defaultSiteTheme.background),
    surface: safeColor(theme.surface, defaultSiteTheme.surface),
    surfaceSoft: safeColor(theme.surfaceSoft, defaultSiteTheme.surfaceSoft),
    ink: safeColor(theme.ink, defaultSiteTheme.ink),
    muted: safeColor(theme.muted, defaultSiteTheme.muted),
    primary: safeColor(theme.primary, defaultSiteTheme.primary),
    accent: safeColor(theme.accent, defaultSiteTheme.accent),
    border: safeColor(theme.border, defaultSiteTheme.border),
    success: safeColor(theme.success, defaultSiteTheme.success),
    warning: safeColor(theme.warning, defaultSiteTheme.warning),
    danger: safeColor(theme.danger, defaultSiteTheme.danger),
  };
}

export function siteThemeFromSocials(socials: unknown): SiteTheme {
  if (!socials || typeof socials !== "object" || Array.isArray(socials)) {
    return defaultSiteTheme;
  }

  const record = socials as Record<string, unknown>;
  return normalizeSiteTheme(record.theme);
}

export function siteThemeStyle(theme: SiteTheme): CSSProperties {
  const colors = normalizeSiteTheme(theme);

  return {
    "--color-background": colors.background,
    "--color-surface": colors.surface,
    "--color-surface-soft": colors.surfaceSoft,
    "--color-ink": colors.ink,
    "--color-muted": colors.muted,
    "--color-primary": colors.primary,
    "--color-primary-hover": `color-mix(in srgb, ${colors.primary} 82%, ${colors.ink})`,
    "--color-accent": colors.accent,
    "--color-accent-ink": `color-mix(in srgb, ${colors.accent} 55%, ${colors.ink})`,
    "--color-accent-light": `color-mix(in srgb, ${colors.accent} 32%, ${colors.surface})`,
    "--color-border": colors.border,
    "--color-success": colors.success,
    "--color-warning": colors.warning,
    "--color-danger": colors.danger,
  } as CSSProperties;
}
