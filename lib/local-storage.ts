// Local storage utilities for user data management

export interface UserProfile {
  id: string
  email: string
  created_at: string
}

export interface ChordLookup {
  id: string
  user_id: string
  chord_name: string
  chord_type: string
  root_note: string
  looked_up_at: string
  count: number
}

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
  created_at: string
}

// User management
export function createUser(email: string, password: string): UserProfile {
  const user: UserProfile = {
    id: generateId(),
    email,
    created_at: new Date().toISOString(),
  }

  const users = getUsers()
  users[user.id] = { ...user, password }
  localStorage.setItem("chord_app_users", JSON.stringify(users))

  return user
}

export function authenticateUser(email: string, password: string): UserProfile | null {
  const users = getUsers()
  const user = Object.values(users).find((u) => u.email === email && u.password === password)
  return user ? { id: user.id, email: user.email, created_at: user.created_at } : null
}

export function getCurrentUser(): UserProfile | null {
  const userId = localStorage.getItem("chord_app_current_user")
  if (!userId) return null

  const users = getUsers()
  const user = users[userId]
  return user ? { id: user.id, email: user.email, created_at: user.created_at } : null
}

export function setCurrentUser(userId: string | null): void {
  if (userId) {
    localStorage.setItem("chord_app_current_user", userId)
  } else {
    localStorage.removeItem("chord_app_current_user")
  }
}

function getUsers(): Record<string, UserProfile & { password: string }> {
  try {
    return JSON.parse(localStorage.getItem("chord_app_users") || "{}")
  } catch {
    return {}
  }
}

// Chord lookup management
export function addChordLookup(userId: string, chordName: string, chordType: string, rootNote: string): void {
  const lookups = getChordLookups(userId)
  const existingIndex = lookups.findIndex((l) => l.chord_name === chordName && l.chord_type === chordType)

  if (existingIndex >= 0) {
    lookups[existingIndex].count += 1
    lookups[existingIndex].looked_up_at = new Date().toISOString()
  } else {
    lookups.push({
      id: generateId(),
      user_id: userId,
      chord_name: chordName,
      chord_type: chordType,
      root_note: rootNote,
      looked_up_at: new Date().toISOString(),
      count: 1,
    })
  }

  // Keep only last 30 days and limit to 100 entries
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const filtered = lookups
    .filter((l) => new Date(l.looked_up_at) > thirtyDaysAgo)
    .sort((a, b) => new Date(b.looked_up_at).getTime() - new Date(a.looked_up_at).getTime())
    .slice(0, 100)

  localStorage.setItem(`chord_app_lookups_${userId}`, JSON.stringify(filtered))
}

export function getChordLookups(userId: string): ChordLookup[] {
  try {
    return JSON.parse(localStorage.getItem(`chord_app_lookups_${userId}`) || "[]")
  } catch {
    return []
  }
}

// Favorite chords management
export function addFavoriteChord(userId: string, chordName: string, chordType: string, rootNote: string): void {
  const favorites = getFavoriteChords(userId)
  const exists = favorites.some((f) => f.chord_name === chordName && f.chord_type === chordType)

  if (!exists) {
    favorites.push({
      id: generateId(),
      user_id: userId,
      chord_name: chordName,
      chord_type: chordType,
      root_note: rootNote,
      created_at: new Date().toISOString(),
    })

    localStorage.setItem(`chord_app_favorites_${userId}`, JSON.stringify(favorites))
  }
}

export function removeFavoriteChord(userId: string, chordName: string, chordType: string): void {
  const favorites = getFavoriteChords(userId)
  const filtered = favorites.filter((f) => !(f.chord_name === chordName && f.chord_type === chordType))
  localStorage.setItem(`chord_app_favorites_${userId}`, JSON.stringify(filtered))
}

/**
 * Toggles a chord in / out of the user’s favourites.
 */
export function toggleFavoriteChord(userId: string, chordName: string, chordType: string, rootNote: string): void {
  if (isChordFavorite(userId, chordName, chordType)) {
    removeFavoriteChord(userId, chordName, chordType)
  } else {
    addFavoriteChord(userId, chordName, chordType, rootNote)
  }
}

export function getFavoriteChords(userId: string): FavoriteChord[] {
  try {
    return JSON.parse(localStorage.getItem(`chord_app_favorites_${userId}`) || "[]")
  } catch {
    return []
  }
}

export function isChordFavorite(userId: string, chordName: string, chordType: string): boolean {
  const favorites = getFavoriteChords(userId)
  return favorites.some((f) => f.chord_name === chordName && f.chord_type === chordType)
}

// Saved progressions management
export function saveProgression(
  userId: string,
  name: string,
  chords: string[],
  description?: string,
  tags?: string[],
): void {
  const progressions = getSavedProgressions(userId)

  progressions.push({
    id: generateId(),
    user_id: userId,
    name,
    description,
    chords,
    tags,
    created_at: new Date().toISOString(),
  })

  localStorage.setItem(`chord_app_progressions_${userId}`, JSON.stringify(progressions))
}

export function deleteSavedProgression(userId: string, progressionId: string): void {
  const progressions = getSavedProgressions(userId)
  const filtered = progressions.filter((p) => p.id !== progressionId)
  localStorage.setItem(`chord_app_progressions_${userId}`, JSON.stringify(filtered))
}

export function getSavedProgressions(userId: string): SavedProgression[] {
  try {
    return JSON.parse(localStorage.getItem(`chord_app_progressions_${userId}`) || "[]")
  } catch {
    return []
  }
}

// Utility functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
