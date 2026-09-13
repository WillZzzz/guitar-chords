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
  // `t` (LanguageContext) and `user` (AuthContext, re-emitted on every auth
  // event including no-op token refreshes) both hand out new references far
  // more often than the data actually needs refetching. Keying the effect off
  // `user?.id` (a stable primitive) instead of the `user` object, and reading
  // `t` through a ref, stops a fresh Supabase request from firing on every
  // unrelated re-render — that redundant-request burst was the likely cause
  // of intermittent "Failed to load your library" errors on page load.
  const tRef = useRef(t)
  tRef.current = t

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
      if (requestIdRef.current === requestId) toast.error(tRef.current("user-library.toast-load-failed"))
    } finally {
      if (requestIdRef.current === requestId) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

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
