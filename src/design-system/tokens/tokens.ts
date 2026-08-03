/** Values live in tokens.css. TypeScript only exposes stable semantic names. */
export const token = {
  color: {
    textPrimary: "var(--ds-color-text-primary)",
    textInverse: "var(--ds-color-text-inverse)",
    surfaceCanvas: "var(--ds-color-surface-canvas)",
    surfaceRaised: "var(--ds-color-surface-raised)",
    actionAccent: "var(--ds-color-action-accent)",
    focus: "var(--ds-color-focus)",
  },
  space: { pageInline: "var(--ds-space-page-inline)" },
  radius: { control: "var(--ds-radius-control)", card: "var(--ds-radius-card)", pill: "var(--ds-radius-pill)" },
  motion: { fast: "var(--ds-duration-fast)", base: "var(--ds-duration-base)", slow: "var(--ds-duration-slow)" },
  layout: { navigationHeight: "var(--ds-navigation-height)", navigationItemHeight: "var(--ds-navigation-item-height)", navigationReserve: "var(--ds-navigation-reserve)" },
  layer: { nav: "var(--ds-layer-nav)", overlay: "var(--ds-layer-overlay)", toast: "var(--ds-layer-toast)" },
} as const;

export type TrazaTheme = "electric" | "paper" | "night";
