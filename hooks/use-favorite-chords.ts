"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getFavoriteChords, removeFavoriteChord, LIBRARY_CHANGED_EVENT, type FavoriteChord } from "@/lib/user-data"
import { toast } from "sonner"

// Shared data source for the "My Chords" favorites list — used by both the
// full detail panel (desktop + mobile Full view) and the mobile Simple rail,
// so they stay in sync without each fetching independently.
export function useFavoriteChords(t: (key: string) => string) {
  const { user } = useAuth()
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
    window.addEventListener(LIBRARY_CHANGED_EVENT, loadFavorites)
    return () => window.removeEventListener(LIBRARY_CHANGED_EVENT, loadFavorites)
  }, [loadFavorites])

  const removeFavorite = useCallback(
    async (fav: FavoriteChord) => {
      if (!user) return
      try {
        await removeFavoriteChord(user.id, fav.chord_name)
        setFavorites((prev) => prev.filter((f) => f.id !== fav.id))
        toast.success(t("user-library.toast-favorite-removed"))
      } catch {
        toast.error(t("user-library.toast-favorite-remove-failed"))
      }
    },
    [user, t]
  )

  return { favorites, loading, removeFavorite, user }
}
