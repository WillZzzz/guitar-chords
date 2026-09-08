"use client"

import { useLanguage } from "@/contexts/language-context"
import type { SavedProgression, EditableProgression } from "@/lib/user-data"
import { ChevronsLeft } from "lucide-react"

export interface MyProgressionsSimpleRailProps {
  isSignedIn: boolean
  progressions: SavedProgression[]
  loading: boolean
  onProgressionEdit?: (progression: EditableProgression) => void
  onExpand: () => void
}

// Thin, name-only view for mobile — one column, tap a progression to load it
// into the builder. Community browsing lives in Full view only. Presentational
// only — data comes from the same source as MyProgressionsPanel (owned by
// MainContent), so switching between simple/full never re-fetches.
export default function MyProgressionsSimpleRail({ isSignedIn, progressions, loading, onProgressionEdit, onExpand }: MyProgressionsSimpleRailProps) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center px-2 py-2 border-b border-[#e6dcd2] dark:border-slate-700 bg-[#d2deee] dark:bg-slate-800">
        <button
          type="button"
          onClick={onExpand}
          title={t("ui.expand")}
          className="h-6 w-6 min-h-0 shrink-0 rounded-md bg-[#fffdfa] dark:bg-slate-900 border border-[#e6dcd2] dark:border-slate-700 flex items-center justify-center text-[#597399] dark:text-blue-300"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {!isSignedIn || loading || progressions.length === 0 ? (
          <p className="text-[10px] text-center text-muted-foreground px-2 py-3">
            {!isSignedIn
              ? t("progression-builder.sign-in-mine")
              : loading
                ? ""
                : t("progression-builder.empty-mine")}
          </p>
        ) : (
          progressions.map((prog) => (
            <button
              key={prog.id}
              type="button"
              onClick={() => onProgressionEdit?.({
                id: prog.id, name: prog.name, description: prog.description, chords: prog.chords, tags: prog.tags,
              })}
              className="w-full px-2 py-1.5 text-left text-xs font-semibold text-[#37302a] dark:text-slate-100 hover:bg-[#eaeff5] dark:hover:bg-slate-800 transition-colors truncate"
              title={prog.name}
            >
              {prog.name}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
