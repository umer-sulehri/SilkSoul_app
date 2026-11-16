import type { CSSProperties } from "react";
import type { ProductTheme } from "@/types/catalog";

const hexPattern = /^#[0-9a-fA-F]{6}$/;

function safeColor(value: string, fallback: string) {
  return hexPattern.test(value) ? value : fallback;
}

export function productThemeStyle(theme: ProductTheme): CSSProperties {
  const primary = safeColor(theme.primary, "#3e5a44");
  const accent = safeColor(theme.accent, "#c19a5b");
  const soft = safeColor(theme.soft, "#e9efe1");

  return {
    "--color-primary": primary,
    "--color-primary-hover": `color-mix(in srgb, ${primary} 82%, #1f2d23)`,
    "--color-accent": accent,
    "--color-accent-ink": `color-mix(in srgb, ${accent} 55%, #1f2d23)`,
    "--color-accent-light": `color-mix(in srgb, ${accent} 32%, #fffdf7)`,
    "--color-surface-soft": soft,
  } as CSSProperties;
}
