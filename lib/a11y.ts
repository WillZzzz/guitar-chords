import type { KeyboardEvent } from "react"

// Spread onto a non-interactive element (div/Card) used as a click target —
// these can't be real <button>s because they contain their own nested
// interactive children (delete/publish buttons etc.), which isn't valid
// inside a <button>. This makes them keyboard-reachable and activatable.
export function clickableDivProps(onClick: () => void) {
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onClick()
      }
    },
  }
}
