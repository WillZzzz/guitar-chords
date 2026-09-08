"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import {
  getPublicProgressions,
  copyPublicProgression,
  type SavedProgression,
  type PublicProgression,
  type EditableProgression,
} from "@/lib/user-data"
import { formatDistanceToNow } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import { ListMusic, Trash2, ArrowRight, Copy, Users, Bookmark, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { EmptyState, LibraryLoadingSkeleton } from "./library-ui"

const dateFnsLocales = { en: enUS, zh: zhCN }

type Mode = "mine" | "community"

export interface MyProgressionsPanelProps {
  isSignedIn: boolean
  progressions: SavedProgression[]
  loading: boolean
  onDeleteProgression: (id: string) => void
  onTogglePublic: (prog: SavedProgression, isPublic: boolean) => void
  onProgressionEdit?: (progression: EditableProgression) => void
  onCollapse?: () => void
}

// "Mine" data is presentational (comes from the useSavedProgressions hook
// owned by MainContent, shared with the Simple rail, so it stays loaded —
// no re-fetch flash across simple/full transitions). Community browsing
// stays local since it's Full-view-only.
export default function MyProgressionsPanel({
  isSignedIn,
  progressions,
  loading: loadingMine,
  onDeleteProgression,
  onTogglePublic,
  onProgressionEdit,
  onCollapse,
}: MyProgressionsPanelProps) {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const dateFnsLocale = dateFnsLocales[language]
  const [mode, setMode] = useState<Mode>("mine")
  const [community, setCommunity] = useState<PublicProgression[]>([])
  const [loadingCommunity, setLoadingCommunity] = useState(false)
  const communityRequestIdRef = useRef(0)

  const loadCommunity = useCallback(async () => {
    const requestId = ++communityRequestIdRef.current
    setLoadingCommunity(true)
    try {
      const pubs = await getPublicProgressions()
      if (communityRequestIdRef.current !== requestId) return
      setCommunity(pubs)
    } catch {
      if (communityRequestIdRef.current === requestId) toast.error(t("progression-builder.toast-community-load-failed"))
    } finally {
      if (communityRequestIdRef.current === requestId) setLoadingCommunity(false)
    }
  }, [t])

  useEffect(() => {
    if (mode === "community") loadCommunity()
  }, [mode, loadCommunity])

  const handleDeleteProgression = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteProgression(id)
  }

  const handleSaveCopy = async (prog: PublicProgression, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return
    try {
      await copyPublicProgression(user.id, prog.name, prog.chords, prog.description, prog.tags)
      toast.success(t("progression-builder.toast-copy-saved"))
    } catch {
      toast.error(t("progression-builder.toast-copy-failed"))
    }
  }

  const communityFeed = community.filter((p) => p.user_id !== user?.id)

  return (
    <div className="flex flex-col h-full">
      <div className="relative px-4 pt-4 pb-3 border-b border-[#e6dcd2] dark:border-slate-700 bg-[#d2deee] dark:bg-slate-800">
        <h2 className="font-semibold text-sm text-[#37302a] dark:text-blue-100">{t("user-library.title-my-progressions")}</h2>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            title={t("nav.my-progressions")}
            className="absolute top-3 right-3 h-7 w-7 min-h-0 rounded-md bg-[#fffdfa] dark:bg-slate-900 border border-[#e6dcd2] dark:border-slate-700 flex items-center justify-center text-[#597399] dark:text-blue-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setMode("mine")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
              mode === "mine" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Bookmark className="h-3 w-3" />
            {t("progression-builder.tab-mine")}
          </button>
          <button
            onClick={() => setMode("community")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
              mode === "community" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Users className="h-3 w-3" />
            {t("progression-builder.tab-community")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {mode === "mine" ? t("progression-builder.caption-mine") : t("progression-builder.caption-community")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {mode === "mine" ? (
          !isSignedIn ? (
            <EmptyState icon={<ListMusic className="h-8 w-8" />} message={t("progression-builder.sign-in-mine")} />
          ) : loadingMine ? (
            <LibraryLoadingSkeleton />
          ) : progressions.length === 0 ? (
            <EmptyState icon={<ListMusic className="h-8 w-8" />} message={t("progression-builder.empty-mine")} />
          ) : (
            progressions.map((prog) => (
              <Card key={prog.id}
                className="cursor-pointer hover:shadow-sm hover:border-[#597399]/50 transition-all"
                onClick={() => onProgressionEdit?.({
                  id: prog.id, name: prog.name, description: prog.description, chords: prog.chords, tags: prog.tags,
                })}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <p className="font-semibold text-sm truncate">{prog.name}</p>
                        <ArrowRight className="h-3 w-3 text-[#597399] shrink-0" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prog.chords.slice(0, 6).map((chord, i) => (
                          <Badge key={i} variant="outline" className="text-xs px-1.5 py-0">{chord}</Badge>
                        ))}
                        {prog.chords.length > 6 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0">+{prog.chords.length - 6}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {formatDistanceToNow(new Date(prog.updated_at ?? prog.created_at), { addSuffix: true, locale: dateFnsLocale })}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => handleDeleteProgression(prog.id, e)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div
                    className="flex items-center justify-between gap-2 mt-2 pt-2 border-t"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs text-muted-foreground">
                      {prog.is_public ? t("progression-builder.unpublish-button") : t("progression-builder.publish-button")}
                    </span>
                    <Switch
                      checked={prog.is_public}
                      onCheckedChange={(checked) => onTogglePublic(prog, checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : loadingCommunity ? (
          <LibraryLoadingSkeleton />
        ) : communityFeed.length === 0 ? (
          <EmptyState icon={<Users className="h-8 w-8" />} message={t("progression-builder.empty-community")} />
        ) : (
          communityFeed.map((prog) => (
            <Card key={prog.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{prog.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("progression-builder.by-author").replace("{author}", prog.author_name)}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {prog.chords.slice(0, 6).map((chord, i) => (
                      <Badge key={i} variant="outline" className="text-xs px-1.5 py-0">{chord}</Badge>
                    ))}
                    {prog.chords.length > 6 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">+{prog.chords.length - 6}</Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 gap-1.5"
                    onClick={(e) => handleSaveCopy(prog, e)}
                  >
                    <Copy className="h-3 w-3" />
                    {t("progression-builder.save-copy-button")}
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
