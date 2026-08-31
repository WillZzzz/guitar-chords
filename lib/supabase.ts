import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl !== "https://placeholder.supabase.co" &&
  supabaseAnonKey !== "placeholder_key"

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Types for our database tables
export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  created_at: string
  updated_at: string
}

export interface ChordLookup {
  id: string
  user_id: string
  chord_name: string
  chord_data: any
  looked_up_at: string
  lookup_count: number
}

export interface FavoriteChord {
  id: string
  user_id: string
  chord_name: string
  chord_data: any
  notes: string | null
  created_at: string
}

export interface ChordProgression {
  id: string
  user_id: string
  name: string
  description: string | null
  chords: any[]
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

// Auth helper functions
export const signUp = async (email: string, password: string, displayName?: string) => {
  if (!supabase) {
    return { 
      data: null, 
      error: { message: "Supabase is not configured. Please set up your environment variables." } 
    }
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    return { 
      data: null, 
      error: { message: "Supabase is not configured. Please set up your environment variables." } 
    }
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  if (!supabase) {
    return { error: { message: "Supabase is not configured. Please set up your environment variables." } }
  }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPasswordForEmail = async (email: string) => {
  if (!supabase) {
    return { error: { message: "Supabase is not configured. Please set up your environment variables." } }
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
  })
  return { error }
}

export const updatePassword = async (newPassword: string) => {
  if (!supabase) {
    return { error: { message: "Supabase is not configured. Please set up your environment variables." } }
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error }
}

// Chord lookup functions
export const saveChordLookup = async (userId: string, chordName: string, chordData: any) => {
  if (!supabase) return { error: { message: "Supabase is not configured." } }

  // Check if chord was already looked up recently
  const { data: existing } = await supabase
    .from("chord_lookups")
    .select("*")
    .eq("user_id", userId)
    .eq("chord_name", chordName)
    .gte("looked_up_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
    .single()

  if (existing) {
    // Update lookup count
    const { error } = await supabase
      .from("chord_lookups")
      .update({
        lookup_count: existing.lookup_count + 1,
        looked_up_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
    return { error }
  } else {
    // Create new lookup record
    const { error } = await supabase.from("chord_lookups").insert({
      user_id: userId,
      chord_name: chordName,
      chord_data: chordData,
      looked_up_at: new Date().toISOString(),
    })
    return { error }
  }
}

export const getRecentChordLookups = async (userId: string, limit = 50) => {
  if (!supabase) return { data: null, error: { message: "Supabase is not configured." } }

  const { data, error } = await supabase
    .from("chord_lookups")
    .select("*")
    .eq("user_id", userId)
    .gte("looked_up_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .order("looked_up_at", { ascending: false })
    .limit(limit)

  return { data, error }
}

export const deleteChordLookup = async (userId: string, id: string) => {
  if (!supabase) return { error: { message: "Supabase is not configured." } }

  const { error } = await supabase.from("chord_lookups").delete().eq("id", id).eq("user_id", userId)

  return { error }
}

// Like saveChordLookup, but with no time-window on the dedup check — used for
// progression lookups, where the "chord_name" column holds a stable progression
// id rather than a chord symbol, so the same id should always update the same
// row regardless of how long ago it was last touched.
export const upsertProgressionLookup = async (userId: string, progressionId: string, chordData: any) => {
  if (!supabase) return { error: { message: "Supabase is not configured." } }

  const { data: existing } = await supabase
    .from("chord_lookups")
    .select("*")
    .eq("user_id", userId)
    .eq("chord_name", progressionId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from("chord_lookups")
      .update({
        chord_data: chordData,
        lookup_count: existing.lookup_count + 1,
        looked_up_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
    return { error }
  } else {
    const { error } = await supabase.from("chord_lookups").insert({
      user_id: userId,
      chord_name: progressionId,
      chord_data: chordData,
      looked_up_at: new Date().toISOString(),
    })
    return { error }
  }
}

// Favorite chords functions
export const addToFavorites = async (userId: string, chordName: string, chordData: any, notes?: string) => {
  if (!supabase) return { error: { message: "Supabase is not configured." } }

  const { error } = await supabase.from("favorite_chords").insert({
    user_id: userId,
    chord_name: chordName,
    chord_data: chordData,
    notes: notes || null,
  })

  return { error }
}

export const removeFromFavorites = async (userId: string, chordName: string) => {
  if (!supabase) return { error: { message: "Supabase is not configured." } }

  const { error } = await supabase.from("favorite_chords").delete().eq("user_id", userId).eq("chord_name", chordName)

  return { error }
}

export const getFavoriteChords = async (userId: string) => {
  if (!supabase) return { data: null, error: { message: "Supabase is not configured." } }

  const { data, error } = await supabase
    .from("favorite_chords")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return { data, error }
}

export const isChordFavorited = async (userId: string, chordName: string) => {
  if (!supabase) return false

  const { data } = await supabase
    .from("favorite_chords")
    .select("id")
    .eq("user_id", userId)
    .eq("chord_name", chordName)
    .single()

  return !!data
}

// Chord progressions functions
export const saveChordProgression = async (
  userId: string,
  name: string,
  chords: any[],
  description?: string,
  tags?: string[],
  isPublic = false,
) => {
  if (!supabase) return { error: { message: "Supabase is not configured." } }

  const { data, error } = await supabase
    .from("chord_progressions")
    .insert({
      user_id: userId,
      name,
      description: description || null,
      chords,
      tags: tags || [],
      is_public: isPublic,
    })
    .select()
    .single()

  return { data, error }
}

export const updateChordProgression = async (
  userId: string,
  id: string,
  updates: Partial<Pick<ChordProgression, "name" | "description" | "chords" | "tags" | "is_public">>,
) => {
  if (!supabase) return { error: { message: "Supabase is not configured." } }

  const { data, error } = await supabase
    .from("chord_progressions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single()

  return { data, error }
}

export const deleteChordProgression = async (userId: string, id: string) => {
  if (!supabase) return { error: { message: "Supabase is not configured." } }

  const { error } = await supabase.from("chord_progressions").delete().eq("id", id).eq("user_id", userId)

  return { error }
}

export const getUserChordProgressions = async (userId: string) => {
  if (!supabase) return { data: null, error: { message: "Supabase is not configured." } }

  const { data, error } = await supabase
    .from("chord_progressions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  return { data, error }
}

export const getPublicChordProgressions = async (limit = 20) => {
  if (!supabase) return { data: null, error: { message: "Supabase is not configured." } }

  // No embedded user_profiles join here: chord_progressions.user_id and
  // user_profiles.id both reference auth.users independently, but there is no
  // foreign key *between* the two tables, so PostgREST can't traverse an
  // embed for it. Author names are resolved separately via getUserProfilesByIds.
  const { data, error } = await supabase
    .from("chord_progressions")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit)

  return { data, error }
}

export const getUserProfilesByIds = async (userIds: string[]) => {
  if (!supabase) return { data: null, error: { message: "Supabase is not configured." } }
  if (userIds.length === 0) return { data: [], error: null }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, display_name")
    .in("id", userIds)

  return { data, error }
}
