// Shared per-tool accent palette (Chord Finder / Reverse Lookup / Progression Builder).
// Source of truth for the hex values pulled from the Figma redesign so every
// component that needs an accent color (not just main-content.tsx) stays in sync.
export const TAB_THEME = {
  finder: {
    accent: "#bf6f4a",
    accentDark: "#a05537",
    light: "#fbf4ef",
    border: "#e6c9b8",
  },
  reverse: {
    accent: "#6b8e70",
    accentDark: "#507355",
    light: "#eef3ec",
    border: "#cddcc9",
  },
  progression: {
    accent: "#597399",
    accentDark: "#415a80",
    light: "#eaeff5",
    border: "#c9d5e3",
  },
} as const

export type TabKey = keyof typeof TAB_THEME
