"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import {
  getFavoriteChords,
  removeFavoriteChord,
  LIBRARY_CHANGED_EVENT,
  type FavoriteChord,
} from "@/lib/user-data"
import { formatDistanceToNow } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import { Heart, Music, ExternalLink, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { EmptyState, LibraryLoadingSkeleton } from "./library-ui"

const dateFnsLocales = { en: enUS, zh: zhCN }

export interface MyChordsPanelProps {
  onChordSelect?: (chord: string) => void
  onCountChange?: (count: number) => void
}

export default function MyChordsPanel({ onChordSelect, onCountChange }: MyChordsPanelProps) {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const dateFnsLocale = dateFnsLocales[language]
  const [favorites, setFavorites] = useState<FavoriteChord[]>([])
  const [loading, setLoading] = useState(true)
  const requestIdRef = useRef(0)

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([])
      setLoading(false)
      return
    }
    const requestId = ++requestIdRef.current
    setLoading(true)
    try {
      const favs = await getFavoriteChords(user.id)
      if (requestIdRef.current !== requestId) return
      setFavorites(favs)
    } catch {
      if (requestIdRef.current === requestId) toast.error(t("user-library.toast-load-failed"))
    } finally {
      if (requestIdRef.current === requestId) setLoading(false)
    }
  }, [user, t])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  useEffect(() => {
    onCountChange?.(favorites.length)
  }, [favorites.length, onCountChange])

  useEffect(() => {
    window.addEventListener(LIBRARY_CHANGED_EVENT, loadFavorites)
    return () => window.removeEventListener(LIBRARY_CHANGED_EVENT, loadFavorites)
  }, [loadFavorites])

  const handleRemoveFavorite = async (fav: FavoriteChord, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return
    try {
      await removeFavoriteChord(user.id, fav.chord_name)
      setFavorites((prev) => prev.filter((f) => f.id !== fav.id))
      toast.success(t("user-library.toast-favorite-removed"))
    } catch {
      toast.error(t("user-library.toast-favorite-remove-failed"))
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b">
        <h2 className="font-semibold text-sm">{t("user-library.title-my-chords")}</h2>
        <p className="text-xs text-muted-foreground mt-1">{t("user-library.caption-my-chords")}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {!user ? (
          <EmptyState icon={<Heart className="h-8 w-8" />} message={t("user-library.sign-in-my-chords")} />
        ) : loading ? (
          <LibraryLoadingSkeleton />
        ) : favorites.length === 0 ? (
          <EmptyState icon={<Heart className="h-8 w-8" />} message={t("user-library.empty-my-chords")} />
        ) : (
          favorites.map((fav) => (
            <Card key={fav.id} className="cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => onChordSelect?.(fav.chord_name)}>
              <CardContent className="p-3 flex items-center justify-between gap-2">
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
