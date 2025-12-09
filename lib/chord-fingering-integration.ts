// Integration with chord-fingering library for unlimited chord coverage
// @ts-ignore - chord-fingering doesn't have TypeScript definitions
import { findGuitarChord } from 'chord-fingering'

export interface ChordFingeringPosition {
  stringNote: string
  stringIndex: number
  fret: number
  note: string
}

export interface ChordFingeringVariation {
  positionString: string
  positions: ChordFingeringPosition[]
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  description?: string
  name?: string
  startFret?: number
}

export interface ChordFingeringInfo {
  symbol: string
  fullName?: string
  intervals: string[]
  notes: string[]
  fingerings: ChordFingeringVariation[]
}

// Convert chord-fingering position format to our internal format
function convertFingeringPosition(position: ChordFingeringPosition, allPositions: ChordFingeringPosition[]) {
  // Convert string numbering: chord-fingering uses 0-5, we use 1-6
  const ourString = position.stringIndex + 1
  
  if (position.fret <= 0) {
    return {
      string: ourString,
      fret: position.fret, // 0 for open, negative for muted
      finger: 0, // No finger for open/muted
    }
  }
  
  // For fretted notes, assign fingers intelligently based on fret position
  const frettedPositions = allPositions
    .filter(p => p.fret > 0)
    .sort((a, b) => a.fret - b.fret) // Sort by fret number
  
  const fretIndex = frettedPositions.findIndex(p => 
    p.stringIndex === position.stringIndex && p.fret === position.fret
  )
  
  // Assign finger based on fret order (lowest fret = finger 1, etc.)
  const finger = Math.min(fretIndex + 1, 4) // Cap at 4 fingers
  
  return {
    string: ourString,
    fret: position.fret,
    finger: finger,
  }
}

// Determine difficulty based on chord complexity and fret positions
function determineDifficulty(fingering: any): 'Beginner' | 'Intermediate' | 'Advanced' {
  const maxFret = Math.max(...fingering.positions.map((p: any) => p.fret))
  const fretSpan = maxFret - Math.min(...fingering.positions.filter((p: any) => p.fret > 0).map((p: any) => p.fret))
  const numFrets = fingering.positions.filter((p: any) => p.fret > 0).length
  
  // Difficulty heuristics
  if (maxFret > 7) return 'Advanced'
  if (fretSpan > 3 || numFrets > 4) return 'Intermediate'
  if (maxFret > 4) return 'Intermediate'
  return 'Beginner'
}

// Generate fingering name based on position
function generateFingeringName(fingering: any, index: number): string {
  const maxFret = Math.max(...fingering.positions.map((p: any) => p.fret))
  const hasOpenStrings = fingering.positions.some((p: any) => p.fret === 0)
  
  if (maxFret <= 3 && hasOpenStrings) {
    return `Open Position ${index + 1}`
  } else if (maxFret > 7) {
    return `High Position (${maxFret}th fret)`
  } else {
    return `Barre Position (${Math.min(...fingering.positions.filter((p: any) => p.fret > 0).map((p: any) => p.fret))}th fret)`
  }
}

// Helper function to check if a fingering is humanly playable
function isHumanlyPlayable(fingering: any): boolean {
  const positions = fingering.positions || []
  const frettedPositions = positions.filter((p: any) => p.fret > 0)
  
  if (frettedPositions.length === 0) return true // Open chords are fine
  
  // Check fret span (maximum distance between frets)
  const frets = frettedPositions.map((p: any) => p.fret)
  const minFret = Math.min(...frets)
  const maxFret = Math.max(...frets)
  const fretSpan = maxFret - minFret
  
  // Reject if fret span is too large (more than 4 frets is very difficult)
  if (fretSpan > 4) {
    console.log(`🚫 Rejecting fingering: fret span too large (${fretSpan} frets, min: ${minFret}, max: ${maxFret})`)
    return false
  }
  
  // Check for backward fingering patterns (higher strings shouldn't have higher frets consistently)
  const sortedPositions = frettedPositions.sort((a, b) => a.string - b.string)
  let backwardCount = 0
  for (let i = 0; i < sortedPositions.length - 1; i++) {
    const current = sortedPositions[i]
    const next = sortedPositions[i + 1]
    
    // If a higher string (lower number) has a higher fret, that's backward
    if (current.string > next.string && current.fret < next.fret) {
      backwardCount++
    }
  }
  
  // Reject if too many backward patterns (indicates impossible fingering)
  if (backwardCount >= frettedPositions.length - 1) {
    console.log(`🚫 Rejecting fingering: backward pattern (higher strings with higher frets)`)
    return false
  }
  
  // Check for too many fretted strings (more than 4 is difficult)
  if (frettedPositions.length > 4) {
    console.log(`🚫 Rejecting fingering: too many fretted strings (${frettedPositions.length})`)
    return false
  }
  
  // Check for very high frets (above 12th fret is uncommon for chords)
  if (maxFret > 12) {
    console.log(`🚫 Rejecting fingering: too high on neck (max fret: ${maxFret})`)
    return false
  }
  
  console.log(`✅ Accepting fingering: fret span ${fretSpan}, ${frettedPositions.length} fretted strings, range ${minFret}-${maxFret}`)
  return true
}

// Get chord information using chord-fingering library
export function getChordFromFingeringLibrary(chordSymbol: string): ChordFingeringInfo | null {
  try {
    console.log(`🔍 chord-fingering library: searching for "${chordSymbol}"`)
    const chord = findGuitarChord(chordSymbol)
    console.log(`🎵 chord-fingering library raw result:`, chord ? {
      symbol: chord.symbol,
      fingerings: chord.fingerings?.length || 0,
      notes: chord.notes?.length || 0
    } : 'null')
    
    console.log(`🟡 DEBUG: About to check if chord exists and has fingerings`)
    console.log(`🟡 DEBUG: chord exists:`, !!chord)
    console.log(`🟡 DEBUG: chord.fingerings exists:`, !!chord?.fingerings)
    console.log(`🟡 DEBUG: chord.fingerings.length:`, chord?.fingerings?.length)
    
    if (!chord || !chord.fingerings || chord.fingerings.length === 0) {
      console.log(`❌ chord-fingering library: no valid fingerings found for "${chordSymbol}"`)
      return null
    }

    // Convert fingerings to our format and filter out impossible ones
    console.log(`🔍 Starting fingering conversion. Total fingerings to process: ${chord.fingerings.length}`)
    console.log(`🔍 First fingering sample:`, chord.fingerings[0])
    
    const convertedFingerings: ChordFingeringVariation[] = chord.fingerings
      .map((fingering: any, index: number) => {
        console.log(`\n🔍 Processing fingering ${index + 1}:`)
        console.log(`📊 Raw fingering data:`, fingering)
        console.log(`📊 Position string: "${fingering.positionString}"`)
        console.log(`📊 Raw positions:`, fingering.positions)
        
        const difficulty = determineDifficulty(fingering)
        const name = generateFingeringName(fingering, index)
        
        const convertedPositions = fingering.positions.map((pos: any) => {
          const converted = convertFingeringPosition(pos, fingering.positions)
          console.log(`📊 String ${pos.stringIndex} (${pos.stringNote}) fret ${pos.fret} → String ${converted.string} fret ${converted.fret} finger ${converted.finger}`)
          return converted
        })
        
        const result = {
          positionString: fingering.positionString,
          positions: convertedPositions,
          difficulty,
          name,
          description: `${name} - ${difficulty} level`,
          startFret: Math.min(...fingering.positions.filter((p: any) => p.fret > 0).map((p: any) => p.fret)) || 1,
          _raw: fingering // Keep raw data for debugging
        }
        
        console.log(`📊 Converted fingering:`, result)
        return result
      })
      .filter(fingering => isHumanlyPlayable(fingering))

    console.log(`🎵 Filtered fingerings: ${chord.fingerings.length} → ${convertedFingerings.length} (removed ${chord.fingerings.length - convertedFingerings.length} impossible fingerings)`)

    return {
      symbol: chord.symbol || chordSymbol,
      fullName: chord.fullName,
      intervals: chord.intervals || [],
      notes: chord.notes || [],
      fingerings: convertedFingerings,
    }
  } catch (error) {
    console.error(`Error getting chord ${chordSymbol} from fingering library:`, error)
    return null
  }
}

// Check if a chord exists in the fingering library
export function isValidChordInFingeringLibrary(chordSymbol: string): boolean {
  try {
    const chord = findGuitarChord(chordSymbol)
    return chord && chord.fingerings && chord.fingerings.length > 0
  } catch (error) {
    return false
  }
}

// Get all possible fingerings for a chord
export function getAllFingeringsForChord(chordSymbol: string): ChordFingeringVariation[] {
  const chord = getChordFromFingeringLibrary(chordSymbol)
  return chord?.fingerings || []
}