"use client"

import { useState, useCallback, useRef } from "react"
import { getPublicProgressions, type PublicProgression } from "@/lib/user-data"
import { toast } from "sonner"

// Owned by MainContent (not MyProgressionsPanel) so the community feed survives
// the panel collapsing/expanding — without this, every re-open of the panel
// remounted MyProgressionsPanel from scratch and re-ran the fetch, so switching
// to the Community tab always cost a fresh round trip ("takes seconds every
// time"). Now it's fetched once per session and reused.
export function useCommunityProgressions(t: (key: string) => string) {
  const [community, setCommunity] = useState<PublicProgression[]>([])
  const [loading, setLoading] = useState(false)
  const hasLoadedRef = useRef(false)
  const requestIdRef = useRef(0)
  // `t` comes from LanguageContext, which hands out a new function identity on
  // basically every render (its provider isn't memoized). Reading it via a ref
  // instead of a dependency keeps `loadCommunity` referentially stable — the
  // consuming effect in MyProgressionsPanel keys off `onLoadCommunity`, so an
  // unstable callback there fired a fresh fetch on every unrelated re-render
  // while the Community tab was open, racing several requests and
  // occasionally surfacing as "unable to load community progressions".
  const tRef = useRef(t)
  tRef.current = t

  const loadCommunity = useCallback(async (force = false) => {
    if (hasLoadedRef.current && !force) return
    const requestId = ++requestIdRef.current
    setLoading(true)
    try {
      const progs = await getPublicProgressions(20)
      if (requestIdRef.current !== requestId) return
      setCommunity(progs)
      hasLoadedRef.current = true
      setLoading(false)
    } catch {
      if (requestIdRef.current === requestId) {
        toast.error(tRef.current("progression-builder.toast-community-load-failed"))
        setLoading(false)
      }
    }
  }, [])

  return { community, loadingCommunity: loading, loadCommunity }
}
