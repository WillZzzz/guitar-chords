"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import {
  getChordLookups,
  deleteChordLookup,
  LIBRARY_CHANGED_EVENT,
  type ChordLookup,
} from "@/lib/user-data"
import { formatDistanceToNow } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import { Clock, BarChart3, Trash2, Music, ListMusic } from "lucide-react"
import { toast } from "sonner"
import { EmptyState, LibraryLoadingSkeleton } from "./library-ui"

const dateFnsLocales = { en: enUS, zh: zhCN }

export interface HistoryPanelProps {
  onChordSelect?: (chord: string) => void
  onProgressionSelect?: (chords: string[]) => void
}

export default function HistoryPanel({ onChordSelect, onProgressionSelect }: HistoryPanelProps) {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const dateFnsLocale = dateFnsLocales[language]
  const [history, setHistory] = useState<ChordLookup[]>([])
  const [loading, setLoading] = useState(true)
  const requestIdRef = useRef(0)

  const loadHistory = useCallback(async () => {
    if (!user) {
      setHistory([])
      setLoading(false)
      return
    }
    const requestId = ++requestIdRef.current
    setLoading(true)
    try {
      const hist = await getChordLookups(user.id)
      if (requestIdRef.current !== requestId) return
      setHistory(hist)
    } catch {
      if (requestIdRef.current === requestId) toast.error(t("user-library.toast-load-failed"))
    } finally {
      if (requestIdRef.current === requestId) setLoading(false)
    }
  }, [user, t])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    window.addEventListener(LIBRARY_CHANGED_EVENT, loadHistory)
    return () => window.removeEventListener(LIBRARY_CHANGED_EVENT, loadHistory)
  }, [loadHistory])

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return
    try {
      await deleteChordLookup(user.id, id)
      setHistory((prev) => prev.filter((h) => h.id !== id))
      toast.success(t("user-library.toast-history-deleted"))
    } catch {
      toast.error(t("user-library.toast-history-delete-failed"))
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b">
        <h2 className="font-semibold text-sm">{t("user-library.title-history")}</h2>
        <p className="text-xs text-muted-foreground mt-1">{t("user-library.caption-history")}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {!user ? (
          <EmptyState icon={<Clock className="h-8 w-8" />} message={t("user-library.sign-in-history")} />
        ) : loading ? (
          <LibraryLoadingSkeleton />
        ) : history.length === 0 ? (
          <EmptyState icon={<Clock className="h-8 w-8" />} message={t("user-library.empty-history")} />
        ) : (
          history.map((lookup) => (
            <Card key={lookup.id} className="cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() =>
                lookup.kind === "progression"
                  ? onProgressionSelect?.(lookup.chords ?? [])
                  : onChordSelect?.(lookup.chord_name)
              }>
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`rounded-md p-1.5 shrink-0 text-white ${
                      lookup.kind === "progression"
                        ? "bg-gradient-to-br from-orange-400 to-red-500"
                        : "bg-gradient-to-br from-blue-400 to-indigo-500"
                    }`}
                  >
                    {lookup.kind === "progression" ? (
                      <ListMusic className="h-3.5 w-3.5" />
                    ) : (
                      <Music className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{lookup.chord_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatDistanceToNow(new Date(lookup.looked_up_at), { addSuffix: true, locale: dateFnsLocale })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <BarChart3 className="h-3 w-3" />
                    {lookup.count}×
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => handleDeleteHistoryItem(lookup.id, e)}>
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
