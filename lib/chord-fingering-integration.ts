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
function convertFingeringPosition(position: ChordFingeringPosition) {
  return {
    string: 6 - position.stringIndex, // Convert to our string numbering (6=low E, 1=high E)
    fret: position.fret,
    finger: position.fret > 0 ? 1 : 0, // Simple finger assignment for now
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

// Get chord information using chord-fingering library
export function getChordFromFingeringLibrary(chordSymbol: string): ChordFingeringInfo | null {
  try {
    const chord = findGuitarChord(chordSymbol)
    
    if (!chord || !chord.fingerings || chord.fingerings.length === 0) {
      return null
    }

    // Convert fingerings to our format
    const convertedFingerings: ChordFingeringVariation[] = chord.fingerings.map((fingering: any, index: number) => {
      const difficulty = determineDifficulty(fingering)
      const name = generateFingeringName(fingering, index)
      
      return {
        positionString: fingering.positionString,
        positions: fingering.positions.map(convertFingeringPosition),
        difficulty,
        name,
        description: `${name} - ${difficulty} level`,
        startFret: Math.min(...fingering.positions.filter((p: any) => p.fret > 0).map((p: any) => p.fret)) || 1,
      }
    })

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