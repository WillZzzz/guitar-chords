import { Scale, Note, Interval } from 'tonal'

/**
 * Ensures a scale has complete notes by rebuilding it if necessary
 */
function ensureCompleteScale(rootNote: string, scaleType: string): { notes: string[], intervals: string[] } {
  const scale = Scale.get(`${rootNote} ${scaleType}`)
  
  // If we get a valid scale with expected number of notes, return it
  if (scale.notes && scale.notes.length >= 5) {
    return { notes: scale.notes, intervals: scale.intervals || [] }
  }
  
  // For some scales, try alternative names or manual construction
  const scaleAliases: { [key: string]: string[] } = {
    'minor': ['natural minor', 'aeolian'],
    'major': ['ionian'],
    'harmonic minor': ['harmonic minor'],
    'melodic minor': ['melodic minor ascending'],
    'dorian': ['dorian'],
    'mixolydian': ['mixolydian'],
    'lydian': ['lydian'],
    'phrygian': ['phrygian'],
    'locrian': ['locrian'],
    'major pentatonic': ['major pentatonic'],
    'minor pentatonic': ['minor pentatonic'],
    'blues': ['blues', 'blues major']
  }
  
  // Try alternative names
  const aliases = scaleAliases[scaleType] || []
  for (const alias of aliases) {
    const altScale = Scale.get(`${rootNote} ${alias}`)
    if (altScale.notes && altScale.notes.length >= 5) {
      return { notes: altScale.notes, intervals: altScale.intervals || [] }
    }
  }
  
  // Return original even if incomplete (better than nothing)
  return { notes: scale.notes || [], intervals: scale.intervals || [] }
}

export interface ScaleInfo {
  name: string
  notes: string[]
  intervals: string[]
  chordNotes: string[]
  highlightedIndices: number[]
  scaleDegrees: string[]
}

export interface ChordScaleAnalysis {
  primaryScale: ScaleInfo | null
  alternativeScales: ScaleInfo[]
  chordFunction: string
}

// Common scales that chords are typically built from
const COMMON_SCALES = [
  'major',
  'minor', // Use 'minor' instead of 'natural minor' for better Tonal.js compatibility
  'harmonic minor',
  'melodic minor',
  'dorian',
  'mixolydian',
  'lydian',
  'phrygian',
  'locrian',
  'major pentatonic',
  'minor pentatonic',
  'blues',
]

// Roman numeral notation for scale degrees
const SCALE_DEGREES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°', 'I', 'ii', 'iii', 'IV', 'V']
const MINOR_SCALE_DEGREES = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII', 'i', 'ii°', 'III', 'iv', 'v']

/**
 * Analyzes a chord to determine what scale(s) it could come from
 */
export function analyzeChordScale(chordNotes: string[], chordName: string): ChordScaleAnalysis {
  if (!chordNotes || chordNotes.length === 0) {
    return {
      primaryScale: null,
      alternativeScales: [],
      chordFunction: 'Unknown'
    }
  }

  // Get the root note (first note of the chord)
  const rootNote = chordNotes[0]
  const normalizedChordNotes = chordNotes.map(note => Note.simplify(note))
  
  const scaleMatches: ScaleInfo[] = []

  // Check each common scale starting from the root note
  for (const scaleType of COMMON_SCALES) {
    const scaleData = ensureCompleteScale(rootNote, scaleType)
    
    if (scaleData.notes && scaleData.notes.length > 0) {
      const normalizedScaleNotes = scaleData.notes.map(note => Note.simplify(note))
      
      
      // Check if all chord notes are present in this scale
      const chordNotesInScale = normalizedChordNotes.every(chordNote => 
        normalizedScaleNotes.some(scaleNote => 
          Note.enharmonic(chordNote) === Note.enharmonic(scaleNote)
        )
      )

      if (chordNotesInScale) {
        // Find which positions in the scale correspond to chord notes
        const highlightedIndices = normalizedScaleNotes
          .map((scaleNote, index) => 
            normalizedChordNotes.some(chordNote => 
              Note.enharmonic(chordNote) === Note.enharmonic(scaleNote)
            ) ? index : -1
          )
          .filter(index => index !== -1)

        // Create scale degrees based on the highlighted positions
        const scaleDegrees = normalizedScaleNotes.map((_, index) => {
          const isMinorScale = scaleType.includes('minor') || scaleType === 'dorian' || scaleType === 'phrygian'
          const degrees = isMinorScale ? MINOR_SCALE_DEGREES : SCALE_DEGREES
          
          // Handle scales with more than 7 notes
          if (index < degrees.length) {
            return degrees[index]
          } else {
            // For pentatonic scales (5 notes) or other scales, use numbers
            return `${index + 1}`
          }
        })

        scaleMatches.push({
          name: `${rootNote} ${scaleType}`,
          notes: scaleData.notes,
          intervals: scaleData.intervals || [],
          chordNotes: normalizedChordNotes,
          highlightedIndices,
          scaleDegrees
        })
      }
    }
  }

  // Also check if the chord might come from a different root
  // (e.g., Am chord from C major scale)
  for (const scaleType of ['major', 'minor']) {
    for (let i = 0; i < 12; i++) {
      const testRoot = Note.fromMidi(Note.midi(rootNote)! + i)
      const scaleData = ensureCompleteScale(testRoot, scaleType)
      
      if (scaleData.notes && scaleData.notes.length > 0) {
        const normalizedScaleNotes = scaleData.notes.map(note => Note.simplify(note))
        
        const chordNotesInScale = normalizedChordNotes.every(chordNote => 
          normalizedScaleNotes.some(scaleNote => 
            Note.enharmonic(chordNote) === Note.enharmonic(scaleNote)
          )
        )

        if (chordNotesInScale) {
          const highlightedIndices = normalizedScaleNotes
            .map((scaleNote, index) => 
              normalizedChordNotes.some(chordNote => 
                Note.enharmonic(chordNote) === Note.enharmonic(scaleNote)
              ) ? index : -1
            )
            .filter(index => index !== -1)

          const scaleDegrees = normalizedScaleNotes.map((_, index) => {
            const isMinorScale = scaleType.includes('minor')
            const degrees = isMinorScale ? MINOR_SCALE_DEGREES : SCALE_DEGREES
            
            // Handle scales with more than 7 notes
            if (index < degrees.length) {
              return degrees[index]
            } else {
              // For pentatonic scales (5 notes) or other scales, use numbers
              return `${index + 1}`
            }
          })

          // Don't add duplicates and don't add the same root we already checked
          const scaleName = `${testRoot} ${scaleType}`
          const isDuplicate = scaleMatches.some(match => match.name === scaleName)
          
          if (!isDuplicate && testRoot !== rootNote) {
            scaleMatches.push({
              name: scaleName,
              notes: scaleData.notes,
              intervals: scaleData.intervals || [],
              chordNotes: normalizedChordNotes,
              highlightedIndices,
              scaleDegrees
            })
          }
        }
      }
    }
  }

  // Sort by relevance - prefer scales that start with the chord root
  scaleMatches.sort((a, b) => {
    const aStartsWithRoot = a.name.startsWith(rootNote)
    const bStartsWithRoot = b.name.startsWith(rootNote)
    
    if (aStartsWithRoot && !bStartsWithRoot) return -1
    if (!aStartsWithRoot && bStartsWithRoot) return 1
    
    // Prefer major and minor scales
    const aIsMajorMinor = a.name.includes('major') || a.name.includes('minor')
    const bIsMajorMinor = b.name.includes('major') || b.name.includes('minor')
    
    if (aIsMajorMinor && !bIsMajorMinor) return -1
    if (!aIsMajorMinor && bIsMajorMinor) return 1
    
    return 0
  })

  const primaryScale = scaleMatches[0] || null
  const alternativeScales = scaleMatches.slice(1, 4) // Show up to 3 alternatives

  // Determine chord function
  const chordFunction = determineChordFunction(chordName, primaryScale)

  return {
    primaryScale,
    alternativeScales,
    chordFunction
  }
}

/**
 * Determines the functional role of a chord within a scale
 */
function determineChordFunction(chordName: string, scaleInfo: ScaleInfo | null): string {
  if (!scaleInfo) return 'Unknown'

  const chordRoot = chordName.replace(/[^A-G#b].*/, '')
  const scaleRoot = scaleInfo.name.split(' ')[0]
  
  if (chordRoot === scaleRoot) {
    if (scaleInfo.name.includes('major')) {
      return 'Tonic (I) - Home chord'
    } else if (scaleInfo.name.includes('minor')) {
      return 'Tonic (i) - Home chord'
    }
  }

  // Calculate the interval between chord root and scale root
  try {
    const interval = Interval.distance(scaleRoot, chordRoot)
    const semitones = Interval.semitones(interval)
    
    switch (semitones) {
      case 0: return 'Tonic (I/i) - Home chord'
      case 2: return 'Supertonic (ii/II) - Predominant'
      case 4: return 'Mediant (iii/III) - Tonic substitute'
      case 5: return 'Subdominant (IV/iv) - Predominant'
      case 7: return 'Dominant (V) - Creates tension'
      case 9: return 'Submediant (vi/VI) - Tonic substitute'
      case 11: return 'Leading tone (vii°) - Dominant function'
      default: return 'Chromatic extension'
    }
  } catch {
    return 'Related chord'
  }
}

/**
 * Gets a color class for chord notes in scale visualization
 */
export function getChordNoteColor(index: number, isHighlighted: boolean): string {
  if (!isHighlighted) {
    return 'text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-800'
  }
  
  // Different colors for different chord tones
  const colors = [
    'text-red-700 bg-red-100 border-red-300 dark:text-red-300 dark:bg-red-900 dark:border-red-700', // Root
    'text-blue-700 bg-blue-100 border-blue-300 dark:text-blue-300 dark:bg-blue-900 dark:border-blue-700', // 3rd
    'text-green-700 bg-green-100 border-green-300 dark:text-green-300 dark:bg-green-900 dark:border-green-700', // 5th
    'text-purple-700 bg-purple-100 border-purple-300 dark:text-purple-300 dark:bg-purple-900 dark:border-purple-700', // 7th
    'text-yellow-700 bg-yellow-100 border-yellow-300 dark:text-yellow-300 dark:bg-yellow-900 dark:border-yellow-700', // Extensions
    'text-pink-700 bg-pink-100 border-pink-300 dark:text-pink-300 dark:bg-pink-900 dark:border-pink-700', // More extensions
  ]
  
  return colors[index % colors.length]
}