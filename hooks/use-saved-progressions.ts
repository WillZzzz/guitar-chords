"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  getSavedProgressions,
  deleteSavedProgression,
  setProgressionPublic,
  LIBRARY_CHANGED_EVENT,
  type SavedProgression,
} from "@/lib/user-data"
import { toast } from "sonner"
import { AnalyticsEvents } from "@/lib/analytics"

// Shared data source for the current user's saved ("mine") progressions —
// used by both the full detail panel and the mobile Simple rail. Community
// browsing stays local to MyProgressionsPanel since only Full view needs it.
export function useSavedProgressions(t: (key: string) => string) {
  const { user } = useAuth()
  const [progressions, setProgressions] = useState<SavedProgression[]>([])
  const [loading, setLoading] = useState(true)
  const requestIdRef = useRef(0)

  const loadMine = useCallback(async () => {
    if (!user) {
      setProgressions([])
      setLoading(false)
      return
    }
    const requestId = ++requestIdRef.current
    setLoading(true)
    try {
      const progs = await getSavedProgressions(user.id)
      if (requestIdRef.current !== requestId) return
      setProgressions(progs)
    } catch {
      if (requestIdRef.current === requestId) toast.error(t("user-library.toast-load-failed"))
    } finally {
      if (requestIdRef.current === requestId) setLoading(false)
    }
  }, [user, t])

  useEffect(() => {
    loadMine()
  }, [loadMine])

  useEffect(() => {
    window.addEventListener(LIBRARY_CHANGED_EVENT, loadMine)
    return () => window.removeEventListener(LIBRARY_CHANGED_EVENT, loadMine)
  }, [loadMine])

  const deleteProgression = useCallback(
    async (id: string) => {
      if (!user) return
      try {
        await deleteSavedProgression(user.id, id)
        setProgressions((prev) => prev.filter((p) => p.id !== id))
        toast.success(t("user-library.toast-progression-deleted"))
      } catch {
        toast.error(t("user-library.toast-progression-delete-failed"))
      }
    },
    [user, t]
  )

  const togglePublic = useCallback(
    async (prog: SavedProgression, isPublic: boolean) => {
      if (!user) return
      setProgressions((prev) => prev.map((p) => (p.id === prog.id ? { ...p, is_public: isPublic } : p)))
      try {
        await setProgressionPublic(user.id, prog.id, isPublic)
        toast.success(isPublic ? t("progression-builder.toast-published") : t("progression-builder.toast-unpublished"))
        if (isPublic) AnalyticsEvents.progressionPublished()
      } catch {
        setProgressions((prev) => prev.map((p) => (p.id === prog.id ? { ...p, is_public: !isPublic } : p)))
        toast.error(t("progression-builder.toast-publish-failed"))
      }
    },
    [user, t]
  )

  return { progressions, loading, deleteProgression, togglePublic, user }
}
