// Integration with @tombatossals/chords-db library for curated chord fingerings
import guitarChordsData from '@tombatossals/chords-db/lib/guitar.json'
const guitarChords = guitarChordsData as any

export interface ChordsDbPosition {
  string: number
  fret: number
  finger: number
}

export interface ChordsDbVariation {
  positionString: string
  positions: ChordsDbPosition[]
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  description?: string
  name?: string
  startFret?: number
}

export interface ChordsDbInfo {
  symbol: string
  fullName?: string
  intervals: string[]
  notes: string[]
  fingerings: ChordsDbVariation[]
}

// Normalize suffix for comparison
function normalizeSuffix(suffix: string): string {
  const suffixMap: { [key: string]: string } = {
    'maj7': 'maj7',
    'major7': 'maj7',
    'M7': 'maj7',
    'major': 'major',
    'maj': 'major',
    'M': 'major',
    '': 'major',
    'minor': 'minor',
    'min': 'minor',
    'm': 'minor',
    '7': '7',
    'dom7': '7',
    '9': '9',
    '6': '6',
    'sus2': 'sus2',
    'sus4': 'sus4',
    'dim': 'dim',
    'dim7': 'dim7',
    'aug': 'aug',
    '+': 'aug'
  }
  
  const normalized = suffixMap[suffix.toLowerCase()] || suffix.toLowerCase()
  console.log(`🔍 Suffix normalization: "${suffix}" → "${normalized}"`)
  return normalized
}

// Translation helper function type
type TranslateFunction = (key: string) => string

// Convert chords-db fingering format to our internal format
function convertChordsDbFingering(chordData: any, fingeringIndex: number, t?: TranslateFunction): ChordsDbVariation {
  const fingering = chordData.positions[fingeringIndex]
  
  // Convert frets array to our position format
  const positions: ChordsDbPosition[] = []
  
  for (let stringIndex = 0; stringIndex < fingering.frets.length; stringIndex++) {
    const relativeFret = fingering.frets[stringIndex]
    const finger = fingering.fingers[stringIndex]
    
    // Skip strings that are not played (-1 fret)
    if (relativeFret === -1) continue
    
    // Convert relative fret to absolute fret position
    const baseFret = fingering.baseFret || 1
    const absoluteFret = relativeFret === 0 ? 0 : relativeFret + baseFret - 1
    
    positions.push({
      string: 6 - stringIndex, // Convert from Low E (index 0) to High E (index 5) → string 6 to 1
      fret: absoluteFret,
      finger: finger
    })
  }
  
  // Generate position string (x for muted, 0 for open, fret number for fretted)
  const positionString = fingering.frets.map((fret: number) => {
    if (fret === -1) return 'x'
    return fret.toString()
  }).join('')
  
  // Determine difficulty based on fret positions and finger stretch
  const frettedPositions = positions.filter(p => p.fret > 0)
  const maxFret = Math.max(...frettedPositions.map(p => p.fret))
  const minFret = Math.min(...frettedPositions.map(p => p.fret))
  const fretSpan = maxFret - minFret
  
  let difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  if (maxFret > 7 || fretSpan > 3) {
    difficulty = 'Advanced'
  } else if (maxFret > 4 || fretSpan > 2) {
    difficulty = 'Intermediate'
  } else {
    difficulty = 'Beginner'
  }
  
  // Generate descriptive name
  const hasOpenStrings = positions.some(p => p.fret === 0)
  const hasBarre = fingering.barres && fingering.barres.length > 0
  
  let name: string
  if (hasBarre) {
    const barreInfo = fingering.barres[0]
    const barreText = t ? t("variations.barre") : "Barre"
    // Use baseFret from fingering data, fallback to barreInfo.fret, then 1
    const fretNumber = fingering.baseFret || barreInfo.fret || 1
    name = `${barreText} (${fretNumber}th fret)`
  } else if (hasOpenStrings && maxFret <= 3) {
    name = t ? t("variations.open-position") : "Open Position"
  } else {
    const positionText = t ? t("variations.position") : "Position"
    name = `${positionText} (${minFret}th fret)`
  }
  
  const difficultyText = t ? t(`chord.difficulty.${difficulty.toLowerCase()}`) : difficulty
  const levelText = t ? t("variations.level") : "level"
  
  
  return {
    positionString,
    positions,
    difficulty,
    name,
    description: `${name} - ${difficultyText} ${levelText}`,
    startFret: fingering.baseFret || minFret || 1
  }
}

// Get chord information from chords-db
export function getChordFromChordsDb(chordSymbol: string, t?: TranslateFunction): ChordsDbInfo | null {
  try {
    console.log(`🔍 chords-db: searching for "${chordSymbol}"`)
    
    // Convert chord symbol to chords-db key format (normalize root note names)
    const normalizeKey = (symbol: string): { rootNote: string; suffix: string } => {
      const rootNoteMap: { [key: string]: string } = {
        'C#': 'Csharp',
        'Db': 'Csharp', // Map Db to C# for consistency
        'D#': 'Eb',
        'F#': 'Fsharp',
        'Gb': 'Fsharp', // Map Gb to F# for consistency  
        'G#': 'Ab',
        'A#': 'Bb'
      }
      
      // Extract root note and suffix
      let rootNote = ''
      let suffix = symbol
      
      for (const [original, normalized] of Object.entries(rootNoteMap)) {
        if (symbol.startsWith(original)) {
          rootNote = normalized
          suffix = symbol.substring(original.length)
          break
        }
      }
      
      // Handle single-letter roots
      if (!rootNote) {
        const firstChar = symbol[0]
        if (['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(firstChar)) {
          rootNote = firstChar
          suffix = symbol.substring(1)
        }
      }
      
      return { rootNote, suffix }
    }
    
    const { rootNote, suffix } = normalizeKey(chordSymbol)
    console.log(`🔍 Parsed: root="${rootNote}", suffix="${suffix}"`)
    
    if (!rootNote || !guitarChords.chords[rootNote]) {
      console.log(`❌ chords-db: root note "${rootNote}" not found`)
      return null
    }
    
    // Find matching chord with the suffix
    const chordsForKey = guitarChords.chords[rootNote]
    const targetSuffix = normalizeSuffix(suffix)
    
    console.log(`🔍 Looking for suffix "${targetSuffix}" in ${chordsForKey.length} chord variations`)
    
    let matchingChord = null
    for (const chord of chordsForKey) {
      const chordSuffix = normalizeSuffix(chord.suffix)
      console.log(`🔍 Checking: "${chordSuffix}" vs "${targetSuffix}"`)
      if (chordSuffix === targetSuffix) {
        matchingChord = chord
        console.log(`✅ Found matching chord: ${chord.key}${chord.suffix}`)
        break
      }
    }
    
    if (!matchingChord) {
      console.log(`❌ chords-db: suffix "${targetSuffix}" not found for ${rootNote}`)
      console.log(`Available suffixes: ${chordsForKey.map((c: any) => c.suffix).join(', ')}`)
      return null
    }
    
    const usedSymbol = `${matchingChord.key}${matchingChord.suffix}`
    console.log(`🎵 chords-db raw result for "${usedSymbol}":`, {
      positions: matchingChord.positions?.length || 0,
      suffix: matchingChord.suffix,
      key: matchingChord.key
    })
    
    if (!matchingChord.positions || matchingChord.positions.length === 0) {
      console.log(`❌ chords-db: no fingering positions found for "${usedSymbol}"`)
      return null
    }
    
    // Convert all fingerings
    const convertedFingerings: ChordsDbVariation[] = matchingChord.positions.map((fingering: any, index: number) => {
      console.log(`\n🔍 Converting fingering ${index + 1} for ${usedSymbol}:`)
      console.log(`📊 Raw fingering:`, fingering)
      
      const converted = convertChordsDbFingering(matchingChord, index, t)
      console.log(`📊 Converted fingering:`, converted)
      
      return converted
    })
    
    // Extract notes from MIDI values if available
    const notes: string[] = []
    if (matchingChord.positions[0] && matchingChord.positions[0].midi) {
      // Convert MIDI numbers to note names (simplified)
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      notes.push(...matchingChord.positions[0].midi.map((midi: number) => {
        const noteIndex = (midi - 12) % 12 // Subtract 12 to get to standard octave
        return noteNames[noteIndex]
      }))
    }
    
    console.log(`🎵 Successfully converted ${convertedFingerings.length} fingerings for ${usedSymbol}`)
    
    return {
      symbol: usedSymbol,
      fullName: `${matchingChord.key}${matchingChord.suffix}`,
      intervals: [], // chords-db doesn't provide intervals directly
      notes: notes,
      fingerings: convertedFingerings
    }
    
  } catch (error) {
    console.error(`Error getting chord ${chordSymbol} from chords-db:`, error)
    return null
  }
}

// Check if a chord exists in chords-db
export function isValidChordInChordsDb(chordSymbol: string): boolean {
  try {
    return getChordFromChordsDb(chordSymbol) !== null
  } catch (error) {
    return false
  }
}

// Get all possible fingerings for a chord
export function getAllFingeringsForChord(chordSymbol: string): ChordsDbVariation[] {
  const chord = getChordFromChordsDb(chordSymbol)
  return chord?.fingerings || []
}