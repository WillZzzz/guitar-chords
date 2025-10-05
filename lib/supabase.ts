import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const signUp = async (email: string, password: string, displayName?: string) => {
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Chord lookup functions
export const saveChordLookup = async (chordName: string, chordData: any) => {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  // Check if chord was already looked up recently
  const { data: existing } = await supabase
    .from("chord_lookups")
    .select("*")
    .eq("user_id", user.id)
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
      user_id: user.id,
      chord_name: chordName,
      chord_data: chordData,
      looked_up_at: new Date().toISOString(),
    })
    return { error }
  }
}

export const getRecentChordLookups = async (limit = 50) => {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("chord_lookups")
    .select("*")
    .eq("user_id", user.id)
    .gte("looked_up_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .order("looked_up_at", { ascending: false })
    .limit(limit)

  return { data, error }
}

// Favorite chords functions
export const addToFavorites = async (chordName: string, chordData: any, notes?: string) => {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("favorite_chords").insert({
    user_id: user.id,
    chord_name: chordName,
    chord_data: chordData,
    notes: notes || null,
  })

  return { error }
}

export const removeFromFavorites = async (chordName: string) => {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("favorite_chords").delete().eq("user_id", user.id).eq("chord_name", chordName)

  return { error }
}

export const getFavoriteChords = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("favorite_chords")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return { data, error }
}

export const isChordFavorited = async (chordName: string) => {
  const user = await getCurrentUser()
  if (!user) return false

  const { data } = await supabase
    .from("favorite_chords")
    .select("id")
    .eq("user_id", user.id)
    .eq("chord_name", chordName)
    .single()

  return !!data
}

// Chord progressions functions
export const saveChordProgression = async (
  name: string,
  chords: any[],
  description?: string,
  tags?: string[],
  isPublic = false,
) => {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase
    .from("chord_progressions")
    .insert({
      user_id: user.id,
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
  id: string,
  updates: Partial<Pick<ChordProgression, "name" | "description" | "chords" | "tags" | "is_public">>,
) => {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase
    .from("chord_progressions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  return { data, error }
}

export const deleteChordProgression = async (id: string) => {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("chord_progressions").delete().eq("id", id).eq("user_id", user.id)

  return { error }
}

export const getUserChordProgressions = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("chord_progressions")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return { data, error }
}

export const getPublicChordProgressions = async (limit = 20) => {
  const { data, error } = await supabase
    .from("chord_progressions")
    .select(`
      *,
      user_profiles!chord_progressions_user_id_fkey(display_name)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit)

  return { data, error }
}
