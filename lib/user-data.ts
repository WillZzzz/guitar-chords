// Supabase-backed user data: favorites, saved progressions, chord lookup history.
// Mirrors the shapes the UI already expects, packing chord_type/root_note into
// the chord_data JSONB column since the live schema has no separate columns for them.

import {
  addToFavorites,
  removeFromFavorites,
  getFavoriteChords as getFavoriteChordsRaw,
  isChordFavorited,
  saveChordLookup,
  getRecentChordLookups,
  deleteChordLookup as deleteChordLookupRaw,
  upsertProgressionLookup,
  saveChordProgression,
  updateChordProgression,
  deleteChordProgression,
  getUserChordProgressions,
  getPublicChordProgressions,
  getUserProfilesByIds,
} from "@/lib/supabase"

export interface FavoriteChord {
  id: string
  user_id: string
  chord_name: string
  chord_type: string
  root_note: string
  created_at: string
}

export interface SavedProgression {
  id: string
  user_id: string
  name: string
  description?: string
  chords: string[]
  tags?: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface PublicProgression {
  id: string
  user_id: string
  name: string
  description?: string
  chords: string[]
  tags?: string[]
  created_at: string
  author_name: string
}

export interface EditableProgression {
  id: string
  name: string
  description?: string
  chords: string[]
  tags?: string[]
}

export interface ChordLookup {
  id: string
  user_id: string
  kind: "chord" | "progression"
  chord_name: string
  chord_type: string
  root_note: string
  /** Only present for kind === "progression" */
  chords?: string[]
  looked_up_at: string
  count: number
}

function throwIfError(error: unknown): void {
  if (!error) return
  const message = typeof error === "string" ? error : (error as { message?: string }).message
  throw new Error(message ?? "Request failed")
}

export const LIBRARY_CHANGED_EVENT = "library-data-changed"

// The "My Library" panel/sheet fetches favorites/progressions/history once on
// mount and has no other way to learn about writes made elsewhere (e.g. the
// Chord Finder or Progression Builder). Broadcasting this event after every
// successful write lets it refetch instead of showing stale data.
function notifyLibraryChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LIBRARY_CHANGED_EVENT))
  }
}

// Favorite chords

export async function getFavoriteChords(userId: string): Promise<FavoriteChord[]> {
  const { data, error } = await getFavoriteChordsRaw(userId)
  throwIfError(error)
  return (data ?? []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    chord_name: row.chord_name,
    chord_type: row.chord_data?.chord_type ?? "",
    root_note: row.chord_data?.root_note ?? "",
    created_at: row.created_at,
  }))
}

export async function isChordFavorite(userId: string, chordName: string): Promise<boolean> {
  return isChordFavorited(userId, chordName)
}

export async function addFavoriteChord(
  userId: string,
  chordName: string,
  chordType: string,
  rootNote: string,
): Promise<void> {
  const { error } = await addToFavorites(userId, chordName, { chord_type: chordType, root_note: rootNote })
  // 23505 = unique_violation on (user_id, chord_name) — already favorited, treat as a no-op
  if (error && (error as { code?: string }).code !== "23505") throwIfError(error)
  notifyLibraryChanged()
}

export async function removeFavoriteChord(userId: string, chordName: string): Promise<void> {
  const { error } = await removeFromFavorites(userId, chordName)
  throwIfError(error)
  notifyLibraryChanged()
}

// Chord lookup history

export async function getChordLookups(userId: string): Promise<ChordLookup[]> {
  const { data, error } = await getRecentChordLookups(userId, 100)
  throwIfError(error)
  return (data ?? []).map((row: any) => {
    if (row.chord_data?.kind === "progression") {
      return {
        id: row.id,
        user_id: row.user_id,
        kind: "progression" as const,
        chord_name: row.chord_data?.name ?? "",
        chord_type: "",
        root_note: "",
        chords: row.chord_data?.chords ?? [],
        looked_up_at: row.looked_up_at,
        count: row.lookup_count,
      }
    }
    return {
      id: row.id,
      user_id: row.user_id,
      kind: "chord" as const,
      chord_name: row.chord_name,
      chord_type: row.chord_data?.chord_type ?? "",
      root_note: row.chord_data?.root_note ?? "",
      looked_up_at: row.looked_up_at,
      count: row.lookup_count,
    }
  })
}

export async function addChordLookup(
  userId: string,
  chordName: string,
  chordType: string,
  rootNote: string,
): Promise<void> {
  const { error } = await saveChordLookup(userId, chordName, { chord_type: chordType, root_note: rootNote })
  throwIfError(error)
  notifyLibraryChanged()
}

// Uses the progression's own id as the lookup key so repeat views (or edits)
// of the same saved progression update the same row, regardless of how long
// ago it was last touched (no 24h dedup window, unlike real chord lookups).
export async function addProgressionLookup(
  userId: string,
  progressionId: string,
  name: string,
  chords: string[],
): Promise<void> {
  const { error } = await upsertProgressionLookup(userId, progressionId, { kind: "progression", name, chords })
  throwIfError(error)
  notifyLibraryChanged()
}

export async function deleteChordLookup(userId: string, id: string): Promise<void> {
  const { error } = await deleteChordLookupRaw(userId, id)
  throwIfError(error)
  notifyLibraryChanged()
}

// Saved progressions

export async function getSavedProgressions(userId: string): Promise<SavedProgression[]> {
  const { data, error } = await getUserChordProgressions(userId)
  throwIfError(error)
  return (data ?? []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    description: row.description ?? undefined,
    chords: row.chords as string[],
    tags: row.tags?.length ? row.tags : undefined,
    is_public: row.is_public ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

export async function saveProgression(
  userId: string,
  name: string,
  chords: string[],
  description?: string,
  tags?: string[],
): Promise<{ id: string }> {
  const { data, error } = await saveChordProgression(userId, name, chords, description, tags, false)
  throwIfError(error)
  notifyLibraryChanged()
  return { id: (data as { id: string }).id }
}

export async function updateProgression(
  userId: string,
  id: string,
  name: string,
  chords: string[],
  description?: string,
  tags?: string[],
): Promise<void> {
  const { error } = await updateChordProgression(userId, id, {
    name,
    description: description ?? null,
    chords,
    tags: tags ?? [],
  })
  throwIfError(error)
  notifyLibraryChanged()
}

export async function setProgressionPublic(userId: string, id: string, isPublic: boolean): Promise<void> {
  const { error } = await updateChordProgression(userId, id, { is_public: isPublic })
  throwIfError(error)
  notifyLibraryChanged()
}

export async function deleteSavedProgression(userId: string, progressionId: string): Promise<void> {
  const { error } = await deleteChordProgression(userId, progressionId)
  throwIfError(error)
  notifyLibraryChanged()
}

// Community: browsing/copying other users' public progressions

export async function getPublicProgressions(limit = 20): Promise<PublicProgression[]> {
  const { data, error } = await getPublicChordProgressions(limit)
  throwIfError(error)
  const rows = data ?? []

  // Author display names are resolved separately (no FK between chord_progressions
  // and user_profiles for PostgREST to embed) — best-effort, falls back to
  // "Anonymous" if it fails or the user_profiles read-policy isn't set up yet.
  const userIds = Array.from(new Set(rows.map((row: any) => row.user_id)))
  let nameById = new Map<string, string>()
  try {
    const { data: profiles } = await getUserProfilesByIds(userIds)
    nameById = new Map((profiles ?? []).map((p: any) => [p.id, p.display_name]))
  } catch {
    // ignore — attribution just falls back to "Anonymous" below
  }

  return rows.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    description: row.description ?? undefined,
    chords: row.chords as string[],
    tags: row.tags?.length ? row.tags : undefined,
    created_at: row.created_at,
    author_name: nameById.get(row.user_id) ?? "Anonymous",
  }))
}

// Thin alias over saveProgression for clarity at the "Save a copy" call site —
// always creates a new private row, never touches the original.
export async function copyPublicProgression(
  userId: string,
  name: string,
  chords: string[],
  description?: string,
  tags?: string[],
): Promise<{ id: string }> {
  return saveProgression(userId, name, chords, description, tags)
}
