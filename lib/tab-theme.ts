// Shared per-tool accent palette (Chord Finder / Reverse Lookup / Progression Builder).
// Source of truth for the hex values pulled from the Figma redesign so every
// component that needs an accent color (not just main-content.tsx) stays in sync.
export const TAB_THEME = {
  finder: {
    accent: "#bf6f4a",
    accentDark: "#a05537",
    light: "#fbf4ef",
    border: "#e6c9b8",
    // Edge-tab / expanded-panel header tint (Figma: "Edge Tab - My Chords")
    tint: "#f2e1d6",
    // Dark-mode active-tab fill (Figma dark-mode redesign, 2026-09) — muted bronze,
    // deliberately less saturated than `accent` so it doesn't glare against the
    // near-black dark background.
    darkAccent: "#8b5e3c",
  },
  reverse: {
    accent: "#6b8e70",
    accentDark: "#507355",
    light: "#eef3ec",
    border: "#cddcc9",
    darkAccent: "#4a7a50",
  },
  progression: {
    accent: "#597399",
    accentDark: "#415a80",
    light: "#eaeff5",
    border: "#c9d5e3",
    // Edge-tab / expanded-panel header tint (Figma: "Edge Tab - My Progressions")
    tint: "#d2deee",
    // Unlike the other two tabs, dark mode goes LIGHTER/brighter here (periwinkle)
    // rather than darker — that's what the Figma redesign specifies.
    darkAccent: "#8aadcc",
  },
} as const

// Shared dark-mode neutral surface tokens (Figma dark-mode redesign, 2026-09).
// Mirrors the same warm near-black palette as the `.dark` CSS variables in
// globals.css, exposed here for the handful of spots that need a literal hex
// (SVG fills, inline styles) rather than a Tailwind class.
export const DARK_NEUTRAL = {
  background: "#151210",
  card: "#1d1a16",
  muted: "#282320",
  mutedHover: "#352e28",
  border: "#3a3430",
  foreground: "#f0ebe5",
  mutedForeground: "#a39890",
  secondaryText: "#d4cdc4",
} as const

export type TabKey = keyof typeof TAB_THEME
