"use client"

import { useLanguage } from "@/contexts/language-context"
import type { FavoriteChord } from "@/lib/user-data"
import { ChevronsLeft } from "lucide-react"

export interface MyChordsSimpleRailProps {
  isSignedIn: boolean
  favorites: FavoriteChord[]
  loading: boolean
  onChordSelect?: (chord: string) => void
  onExpand: () => void
}

// Thin, name-only view for mobile — one column, tap a chord to load it.
// Presentational only — data comes from the same source as MyChordsPanel
// (owned by MainContent), so switching between simple/full never re-fetches.
export default function MyChordsSimpleRail({ isSignedIn, favorites, loading, onChordSelect, onExpand }: MyChordsSimpleRailProps) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center px-2 py-2 border-b border-[#e6dcd2] dark:border-slate-700 bg-[#f2e1d6] dark:bg-slate-800">
        <button
          type="button"
          onClick={onExpand}
          title={t("ui.expand")}
          className="h-6 w-6 min-h-0 shrink-0 rounded-md bg-[#fffdfa] dark:bg-slate-900 border border-[#e6dcd2] dark:border-slate-700 flex items-center justify-center text-[#bf6f4a] dark:text-orange-300"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {!isSignedIn || loading || favorites.length === 0 ? (
          <p className="text-[10px] text-center text-muted-foreground px-2 py-3">
            {!isSignedIn
              ? t("user-library.sign-in-my-chords")
              : loading
                ? ""
                : t("user-library.empty-my-chords")}
          </p>
        ) : (
          favorites.map((fav) => (
            <button
              key={fav.id}
              type="button"
              onClick={() => onChordSelect?.(fav.chord_name)}
              className="w-full px-2 py-1.5 text-center text-sm font-semibold text-[#37302a] dark:text-slate-100 hover:bg-[#fbf4ef] dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
              title={fav.chord_name}
            >
              {fav.chord_name}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
