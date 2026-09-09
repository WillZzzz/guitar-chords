"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import type { FavoriteChord } from "@/lib/user-data"
import { formatDistanceToNow } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import { Heart, Music, ExternalLink, Trash2, ChevronRight } from "lucide-react"
import { EmptyState, LibraryLoadingSkeleton } from "./library-ui"
import { clickableDivProps } from "@/lib/a11y"

const dateFnsLocales = { en: enUS, zh: zhCN }

export interface MyChordsPanelProps {
  isSignedIn: boolean
  favorites: FavoriteChord[]
  loading: boolean
  onRemoveFavorite: (fav: FavoriteChord) => void
  onChordSelect?: (chord: string) => void
  onCollapse?: () => void
}

// Presentational only — data comes from the useFavoriteChords hook owned by
// MainContent, so it stays loaded (no re-fetch flash) across simple/full
// panel transitions on mobile.
export default function MyChordsPanel({ isSignedIn, favorites, loading, onRemoveFavorite, onChordSelect, onCollapse }: MyChordsPanelProps) {
  const { t, language } = useLanguage()
  const dateFnsLocale = dateFnsLocales[language]

  const handleRemoveFavorite = (fav: FavoriteChord, e: React.MouseEvent) => {
    e.stopPropagation()
    onRemoveFavorite(fav)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="relative px-4 pt-4 pb-3 border-b border-[#e6dcd2] dark:border-slate-700 bg-[#f2e1d6] dark:bg-slate-800">
        <h2 className="font-semibold text-sm text-[#37302a] dark:text-orange-100">{t("user-library.title-my-chords")}</h2>
        <p className="text-xs text-[#6b5f55] dark:text-slate-300 mt-1">{t("user-library.caption-my-chords")}</p>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            title={t("nav.my-chords")}
            className="absolute top-3 right-3 h-7 w-7 min-h-0 rounded-md bg-[#fffdfa] dark:bg-slate-900 border border-[#e6dcd2] dark:border-slate-700 flex items-center justify-center text-[#bf6f4a] dark:text-orange-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {!isSignedIn ? (
          <EmptyState icon={<Heart className="h-8 w-8" />} message={t("user-library.sign-in-my-chords")} />
        ) : loading ? (
          <LibraryLoadingSkeleton />
        ) : favorites.length === 0 ? (
          <EmptyState icon={<Heart className="h-8 w-8" />} message={t("user-library.empty-my-chords")} />
        ) : (
          favorites.map((fav) => (
            <Card key={fav.id} className="cursor-pointer hover:shadow-sm transition-shadow"
              {...clickableDivProps(() => onChordSelect?.(fav.chord_name))}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-gradient-to-br from-[#a05537] to-[#bf6f4a] text-white rounded-md p-1.5 shrink-0">
                    <Music className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{fav.chord_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatDistanceToNow(new Date(fav.created_at), { addSuffix: true, locale: dateFnsLocale })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center shrink-0">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); onChordSelect?.(fav.chord_name) }}>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => handleRemoveFavorite(fav, e)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
