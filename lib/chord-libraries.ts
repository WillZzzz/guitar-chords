// Guitar chord library using established Tonal.js chord dictionary + guitar fingerings
import { Chord } from "tonal"

export interface ChordPosition {
  string: number // 1-6 (high E to low E)
  fret: number // -1 for muted, 0 for open, 1+ for fretted
  finger?: number // 1-4 for finger number
}

export interface ChordVariation {
  name: string
  positions: ChordPosition[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  startFret?: number
  description?: string
}

export interface ChordInfo {
  name: string
  symbol: string
  notes: string[]
  intervals: string[]
  quality: string
  variations: ChordVariation[]
  semitones: number[]
}

// Guitar fingering database - corrected positions to prevent dots outside chart
const guitarFingerings: { [key: string]: ChordVariation[] } = {
  // MAJOR CHORDS - Fixed fret positions
  C: [
    {
      name: "C Major (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Classic open C major chord, great for beginners",
    },
    {
      name: "C Major (Alternative)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 3 },
        { string: 5, fret: 3, finger: 4 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Alternative fingering for C major",
    },
    {
      name: "C Major (Barre 3rd)",
      positions: [
        { string: 1, fret: 3, finger: 1 },
        { string: 2, fret: 5, finger: 3 },
        { string: 3, fret: 5, finger: 4 },
        { string: 4, fret: 5, finger: 2 },
        { string: 5, fret: 3, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      startFret: 3,
      description: "Barre chord version, moveable shape",
    },
    {
      name: "C Major (8th Fret)",
      positions: [
        { string: 1, fret: 8, finger: 1 },
        { string: 2, fret: 8, finger: 1 },
        { string: 3, fret: 9, finger: 2 },
        { string: 4, fret: 10, finger: 4 },
        { string: 5, fret: 10, finger: 3 },
        { string: 6, fret: 8, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 8,
      description: "High position C major for bright tone",
    },
  ],
  "C#": [
    {
      name: "C# Major (Barre 4th)",
      positions: [
        { string: 1, fret: 4, finger: 1 },
        { string: 2, fret: 6, finger: 3 },
        { string: 3, fret: 6, finger: 4 },
        { string: 4, fret: 6, finger: 2 },
        { string: 5, fret: 4, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      startFret: 4,
      description: "Barre chord, same shape as C moved up one fret",
    },
  ],
  Db: [
    {
      name: "Db Major (Barre 4th)",
      positions: [
        { string: 1, fret: 4, finger: 1 },
        { string: 2, fret: 6, finger: 3 },
        { string: 3, fret: 6, finger: 4 },
        { string: 4, fret: 6, finger: 2 },
        { string: 5, fret: 4, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      startFret: 4,
      description: "Same as C# major - enharmonic equivalent",
    },
  ],
  D: [
    {
      name: "D Major (Open)",
      positions: [
        { string: 1, fret: 2, finger: 2 },
        { string: 2, fret: 3, finger: 3 },
        { string: 3, fret: 2, finger: 1 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Open D major, essential beginner chord",
    },
    {
      name: "D Major (Barre 5th)",
      positions: [
        { string: 1, fret: 5, finger: 1 },
        { string: 2, fret: 7, finger: 3 },
        { string: 3, fret: 7, finger: 4 },
        { string: 4, fret: 7, finger: 2 },
        { string: 5, fret: 5, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      startFret: 5,
      description: "Barre chord version for fuller sound",
    },
  ],
  "D#": [
    {
      name: "D# Major (Barre 6th)",
      positions: [
        { string: 1, fret: 6, finger: 1 },
        { string: 2, fret: 8, finger: 3 },
        { string: 3, fret: 8, finger: 4 },
        { string: 4, fret: 8, finger: 2 },
        { string: 5, fret: 6, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      startFret: 6,
      description: "Higher position barre chord",
    },
  ],
  Eb: [
    {
      name: "Eb Major (Barre 6th)",
      positions: [
        { string: 1, fret: 6, finger: 1 },
        { string: 2, fret: 8, finger: 3 },
        { string: 3, fret: 8, finger: 4 },
        { string: 4, fret: 8, finger: 2 },
        { string: 5, fret: 6, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      startFret: 6,
      description: "Same as D# major - enharmonic equivalent",
    },
  ],
  E: [
    {
      name: "E Major (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 1, finger: 1 },
        { string: 4, fret: 2, finger: 3 },
        { string: 5, fret: 2, finger: 2 },
        { string: 6, fret: 0 },
      ],
      difficulty: "Beginner",
      description: "Open E major, fundamental guitar chord",
    },
    {
      name: "E Major (Barre 7th)",
      positions: [
        { string: 1, fret: 7, finger: 1 },
        { string: 2, fret: 9, finger: 3 },
        { string: 3, fret: 9, finger: 4 },
        { string: 4, fret: 9, finger: 2 },
        { string: 5, fret: 7, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      startFret: 7,
      description: "Higher position for different tonal color",
    },
  ],
  F: [
    {
      name: "F Major (Barre 1st)",
      positions: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 3, finger: 4 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: 1, finger: 1 },
      ],
      difficulty: "Advanced",
      description: "Full barre F major - challenging but essential",
    },
    {
      name: "F Major (Easy)",
      positions: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 3, finger: 4 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      description: "Easier F major without low E string",
    },
  ],
  "F#": [
    {
      name: "F# Major (Barre 2nd)",
      positions: [
        { string: 1, fret: 2, finger: 1 },
        { string: 2, fret: 2, finger: 1 },
        { string: 3, fret: 3, finger: 2 },
        { string: 4, fret: 4, finger: 4 },
        { string: 5, fret: 4, finger: 3 },
        { string: 6, fret: 2, finger: 1 },
      ],
      difficulty: "Advanced",
      description: "F# major barre chord",
    },
  ],
  Gb: [
    {
      name: "Gb Major (Barre 2nd)",
      positions: [
        { string: 1, fret: 2, finger: 1 },
        { string: 2, fret: 2, finger: 1 },
        { string: 3, fret: 3, finger: 2 },
        { string: 4, fret: 4, finger: 4 },
        { string: 5, fret: 4, finger: 3 },
        { string: 6, fret: 2, finger: 1 },
      ],
      difficulty: "Advanced",
      description: "Same as F# major - enharmonic equivalent",
    },
  ],
  G: [
    {
      name: "G Major (Open)",
      positions: [
        { string: 1, fret: 3, finger: 3 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 1 },
        { string: 6, fret: 3, finger: 2 },
      ],
      difficulty: "Beginner",
      description: "Classic open G major chord",
    },
    {
      name: "G Major (Alternative)",
      positions: [
        { string: 1, fret: 3, finger: 4 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 6, fret: 3, finger: 3 },
      ],
      difficulty: "Beginner",
      description: "Alternative fingering for easier transitions",
    },
    {
      name: "G Major (Rock)",
      positions: [
        { string: 1, fret: 3, finger: 3 },
        { string: 2, fret: 3, finger: 4 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 1 },
        { string: 6, fret: 3, finger: 2 },
      ],
      difficulty: "Intermediate",
      description: "Rock style G with added high B note",
    },
    {
      name: "G Major (Barre 3rd)",
      positions: [
        { string: 1, fret: 3, finger: 1 },
        { string: 2, fret: 3, finger: 1 },
        { string: 3, fret: 4, finger: 2 },
        { string: 4, fret: 5, finger: 4 },
        { string: 5, fret: 5, finger: 3 },
        { string: 6, fret: 3, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 3,
      description: "Barre chord version of G major",
    },
  ],
  "G#": [
    {
      name: "G# Major (Barre 4th)",
      positions: [
        { string: 1, fret: 4, finger: 1 },
        { string: 2, fret: 4, finger: 1 },
        { string: 3, fret: 5, finger: 2 },
        { string: 4, fret: 6, finger: 4 },
        { string: 5, fret: 6, finger: 3 },
        { string: 6, fret: 4, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 4,
      description: "G# major barre chord",
    },
  ],
  Ab: [
    {
      name: "Ab Major (Barre 4th)",
      positions: [
        { string: 1, fret: 4, finger: 1 },
        { string: 2, fret: 4, finger: 1 },
        { string: 3, fret: 5, finger: 2 },
        { string: 4, fret: 6, finger: 4 },
        { string: 5, fret: 6, finger: 3 },
        { string: 6, fret: 4, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 4,
      description: "Same as G# major - enharmonic equivalent",
    },
  ],
  A: [
    {
      name: "A Major (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 2, finger: 2 },
        { string: 3, fret: 2, finger: 3 },
        { string: 4, fret: 2, finger: 1 },
        { string: 5, fret: 0 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Open A major, very common chord",
    },
    {
      name: "A Major (Barre 5th)",
      positions: [
        { string: 1, fret: 5, finger: 1 },
        { string: 2, fret: 5, finger: 1 },
        { string: 3, fret: 6, finger: 2 },
        { string: 4, fret: 7, finger: 4 },
        { string: 5, fret: 7, finger: 3 },
        { string: 6, fret: 5, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 5,
      description: "Barre chord version for fuller sound",
    },
  ],
  "A#": [
    {
      name: "A# Major (Barre 6th)",
      positions: [
        { string: 1, fret: 6, finger: 1 },
        { string: 2, fret: 6, finger: 1 },
        { string: 3, fret: 7, finger: 2 },
        { string: 4, fret: 8, finger: 4 },
        { string: 5, fret: 8, finger: 3 },
        { string: 6, fret: 6, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 6,
      description: "A# major barre chord",
    },
  ],
  Bb: [
    {
      name: "Bb Major (Barre 6th)",
      positions: [
        { string: 1, fret: 6, finger: 1 },
        { string: 2, fret: 6, finger: 1 },
        { string: 3, fret: 7, finger: 2 },
        { string: 4, fret: 8, finger: 4 },
        { string: 5, fret: 8, finger: 3 },
        { string: 6, fret: 6, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 6,
      description: "Same as A# major - enharmonic equivalent",
    },
  ],
  B: [
    {
      name: "B Major (Barre 7th)",
      positions: [
        { string: 1, fret: 7, finger: 1 },
        { string: 2, fret: 7, finger: 1 },
        { string: 3, fret: 8, finger: 2 },
        { string: 4, fret: 9, finger: 4 },
        { string: 5, fret: 9, finger: 3 },
        { string: 6, fret: 7, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 7,
      description: "B major barre chord",
    },
    {
      name: "B Major (Open Position)",
      positions: [
        { string: 1, fret: 2, finger: 1 },
        { string: 2, fret: 4, finger: 3 },
        { string: 3, fret: 4, finger: 4 },
        { string: 4, fret: 4, finger: 2 },
        { string: 5, fret: 2, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      description: "Alternative B major fingering",
    },
  ],

  // MINOR CHORDS - Fixed positions
  Cm: [
    {
      name: "C Minor (Barre 3rd)",
      positions: [
        { string: 1, fret: 3, finger: 1 },
        { string: 2, fret: 4, finger: 2 },
        { string: 3, fret: 5, finger: 4 },
        { string: 4, fret: 5, finger: 3 },
        { string: 5, fret: 3, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      startFret: 3,
      description: "C minor barre chord",
    },
  ],
  "C#m": [
    {
      name: "C# Minor (Barre 4th)",
      positions: [
        { string: 1, fret: 4, finger: 1 },
        { string: 2, fret: 5, finger: 2 },
        { string: 3, fret: 6, finger: 4 },
        { string: 4, fret: 6, finger: 3 },
        { string: 5, fret: 4, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      startFret: 4,
      description: "C# minor barre chord",
    },
  ],
  Dm: [
    {
      name: "D Minor (Open)",
      positions: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 3, finger: 3 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Open D minor chord",
    },
    {
      name: "D Minor (Barre 5th)",
      positions: [
        { string: 1, fret: 5, finger: 1 },
        { string: 2, fret: 6, finger: 2 },
        { string: 3, fret: 7, finger: 4 },
        { string: 4, fret: 7, finger: 3 },
        { string: 5, fret: 5, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      startFret: 5,
      description: "Barre chord version",
    },
  ],
  "D#m": [
    {
      name: "D# Minor (Barre 6th)",
      positions: [
        { string: 1, fret: 6, finger: 1 },
        { string: 2, fret: 7, finger: 2 },
        { string: 3, fret: 8, finger: 4 },
        { string: 4, fret: 8, finger: 3 },
        { string: 5, fret: 6, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      startFret: 6,
      description: "D# minor barre chord",
    },
  ],
  Em: [
    {
      name: "E Minor (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 2, finger: 1 },
        { string: 6, fret: 0 },
      ],
      difficulty: "Beginner",
      description: "Easiest guitar chord - only 2 fingers!",
    },
    {
      name: "E Minor (Barre 7th)",
      positions: [
        { string: 1, fret: 7, finger: 1 },
        { string: 2, fret: 8, finger: 2 },
        { string: 3, fret: 9, finger: 4 },
        { string: 4, fret: 9, finger: 3 },
        { string: 5, fret: 7, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      startFret: 7,
      description: "Higher position E minor",
    },
  ],
  Fm: [
    {
      name: "F Minor (Barre 1st)",
      positions: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 1, finger: 1 },
        { string: 4, fret: 3, finger: 4 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: 1, finger: 1 },
      ],
      difficulty: "Advanced",
      description: "F minor barre chord - challenging",
    },
  ],
  "F#m": [
    {
      name: "F# Minor (Barre 2nd)",
      positions: [
        { string: 1, fret: 2, finger: 1 },
        { string: 2, fret: 2, finger: 1 },
        { string: 3, fret: 2, finger: 1 },
        { string: 4, fret: 4, finger: 4 },
        { string: 5, fret: 4, finger: 3 },
        { string: 6, fret: 2, finger: 1 },
      ],
      difficulty: "Advanced",
      description: "F# minor barre chord",
    },
  ],
  Gm: [
    {
      name: "G Minor (Barre 3rd)",
      positions: [
        { string: 1, fret: 3, finger: 1 },
        { string: 2, fret: 3, finger: 1 },
        { string: 3, fret: 3, finger: 1 },
        { string: 4, fret: 5, finger: 4 },
        { string: 5, fret: 5, finger: 3 },
        { string: 6, fret: 3, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 3,
      description: "G minor barre chord",
    },
  ],
  "G#m": [
    {
      name: "G# Minor (Barre 4th)",
      positions: [
        { string: 1, fret: 4, finger: 1 },
        { string: 2, fret: 4, finger: 1 },
        { string: 3, fret: 4, finger: 1 },
        { string: 4, fret: 6, finger: 4 },
        { string: 5, fret: 6, finger: 3 },
        { string: 6, fret: 4, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 4,
      description: "G# minor barre chord",
    },
  ],
  Am: [
    {
      name: "A Minor (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 3 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 0 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Essential open A minor chord",
    },
    {
      name: "A Minor (Barre 5th)",
      positions: [
        { string: 1, fret: 5, finger: 1 },
        { string: 2, fret: 5, finger: 1 },
        { string: 3, fret: 5, finger: 1 },
        { string: 4, fret: 7, finger: 4 },
        { string: 5, fret: 7, finger: 3 },
        { string: 6, fret: 5, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 5,
      description: "Barre chord version",
    },
  ],
  "A#m": [
    {
      name: "A# Minor (Barre 6th)",
      positions: [
        { string: 1, fret: 6, finger: 1 },
        { string: 2, fret: 6, finger: 1 },
        { string: 3, fret: 6, finger: 1 },
        { string: 4, fret: 8, finger: 4 },
        { string: 5, fret: 8, finger: 3 },
        { string: 6, fret: 6, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 6,
      description: "A# minor barre chord",
    },
  ],
  Bm: [
    {
      name: "B Minor (Barre 7th)",
      positions: [
        { string: 1, fret: 7, finger: 1 },
        { string: 2, fret: 7, finger: 1 },
        { string: 3, fret: 7, finger: 1 },
        { string: 4, fret: 9, finger: 4 },
        { string: 5, fret: 9, finger: 3 },
        { string: 6, fret: 7, finger: 1 },
      ],
      difficulty: "Advanced",
      startFret: 7,
      description: "B minor barre chord",
    },
    {
      name: "B Minor (Open Position)",
      positions: [
        { string: 1, fret: 2, finger: 1 },
        { string: 2, fret: 3, finger: 2 },
        { string: 3, fret: 4, finger: 4 },
        { string: 4, fret: 4, finger: 3 },
        { string: 5, fret: 2, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      description: "Alternative B minor fingering",
    },
  ],

  // DOMINANT 7TH CHORDS - Fixed positions
  C7: [
    {
      name: "C7 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 3, finger: 4 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      description: "Open C7 chord with bluesy sound",
    },
  ],
  D7: [
    {
      name: "D7 (Open)",
      positions: [
        { string: 1, fret: 2, finger: 2 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 3 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Essential D7 chord for blues and folk",
    },
  ],
  E7: [
    {
      name: "E7 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 1, finger: 1 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 6, fret: 0 },
      ],
      difficulty: "Beginner",
      description: "Open E7 - great for blues progressions",
    },
  ],
  G7: [
    {
      name: "G7 (Open)",
      positions: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 6, fret: 3, finger: 3 },
      ],
      difficulty: "Beginner",
      description: "Open G7 chord",
    },
  ],
  A7: [
    {
      name: "A7 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 2, finger: 2 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 1 },
        { string: 5, fret: 0 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Simple A7 chord",
    },
  ],
  B7: [
    {
      name: "B7 (Open)",
      positions: [
        { string: 1, fret: 2, finger: 2 },
        { string: 2, fret: 0 },
        { string: 3, fret: 2, finger: 1 },
        { string: 4, fret: 1, finger: 1 },
        { string: 5, fret: 2, finger: 3 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      description: "B7 chord - common in blues",
    },
  ],

  // MAJOR 7TH CHORDS - Fixed positions
  Cmaj7: [
    {
      name: "Cmaj7 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Beautiful open Cmaj7 chord",
    },
  ],
  Dmaj7: [
    {
      name: "Dmaj7 (Open)",
      positions: [
        { string: 1, fret: 2, finger: 1 },
        { string: 2, fret: 2, finger: 2 },
        { string: 3, fret: 2, finger: 3 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Sweet Dmaj7 chord",
    },
  ],
  Emaj7: [
    {
      name: "Emaj7 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 1, finger: 1 },
        { string: 4, fret: 1, finger: 1 },
        { string: 5, fret: 2, finger: 2 },
        { string: 6, fret: 0 },
      ],
      difficulty: "Beginner",
      description: "Dreamy Emaj7 chord",
    },
  ],
  Fmaj7: [
    {
      name: "Fmaj7 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 3, finger: 3 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Easy Fmaj7 without barre",
    },
  ],
  Gmaj7: [
    {
      name: "Gmaj7 (Open)",
      positions: [
        { string: 1, fret: 2, finger: 1 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 6, fret: 3, finger: 3 },
      ],
      difficulty: "Beginner",
      description: "Bright Gmaj7 chord",
    },
  ],
  Amaj7: [
    {
      name: "Amaj7 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 2, finger: 2 },
        { string: 3, fret: 1, finger: 1 },
        { string: 4, fret: 2, finger: 3 },
        { string: 5, fret: 0 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Jazzy Amaj7 chord",
    },
  ],

  // MINOR 7TH CHORDS - Fixed positions
  Cm7: [
    {
      name: "Cm7 (Barre 3rd)",
      positions: [
        { string: 1, fret: 3, finger: 1 },
        { string: 2, fret: 4, finger: 2 },
        { string: 3, fret: 3, finger: 1 },
        { string: 4, fret: 5, finger: 4 },
        { string: 5, fret: 3, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      startFret: 3,
      description: "Cm7 barre chord",
    },
  ],
  Dm7: [
    {
      name: "Dm7 (Open)",
      positions: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Easy Dm7 chord",
    },
  ],
  Em7: [
    {
      name: "Em7 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 6, fret: 0 },
      ],
      difficulty: "Beginner",
      description: "Super easy Em7 - one finger!",
    },
  ],
  Am7: [
    {
      name: "Am7 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 0 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Simple Am7 chord",
    },
  ],

  // SUSPENDED CHORDS - Fixed positions
  Csus2: [
    {
      name: "Csus2 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Open and airy Csus2",
    },
  ],
  Csus4: [
    {
      name: "Csus4 (Open)",
      positions: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Csus4 with tension",
    },
  ],
  Dsus2: [
    {
      name: "Dsus2 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 3, finger: 3 },
        { string: 3, fret: 2, finger: 1 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Beautiful Dsus2",
    },
  ],
  Dsus4: [
    {
      name: "Dsus4 (Open)",
      positions: [
        { string: 1, fret: 3, finger: 4 },
        { string: 2, fret: 3, finger: 3 },
        { string: 3, fret: 2, finger: 1 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Dsus4 chord",
    },
  ],
  Esus4: [
    {
      name: "Esus4 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 2, finger: 4 },
        { string: 4, fret: 2, finger: 3 },
        { string: 5, fret: 2, finger: 2 },
        { string: 6, fret: 0 },
      ],
      difficulty: "Beginner",
      description: "Esus4 chord",
    },
  ],
  Asus2: [
    {
      name: "Asus2 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 2, finger: 1 },
        { string: 5, fret: 0 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Asus2 chord",
    },
  ],
  Asus4: [
    {
      name: "Asus4 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 3, finger: 3 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 2, finger: 1 },
        { string: 5, fret: 0 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Asus4 chord",
    },
  ],

  // ADD9 CHORDS - Fixed positions
  Cadd9: [
    {
      name: "Cadd9 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 3, finger: 4 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Popular Cadd9 chord",
    },
  ],
  Dadd9: [
    {
      name: "Dadd9 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 3, finger: 3 },
        { string: 3, fret: 2, finger: 1 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Sweet Dadd9 chord",
    },
  ],
  Gadd9: [
    {
      name: "Gadd9 (Open)",
      positions: [
        { string: 1, fret: 3, finger: 4 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 1 },
        { string: 6, fret: 3, finger: 2 },
      ],
      difficulty: "Beginner",
      description: "Rich Gadd9 chord",
    },
  ],

  // POWER CHORDS - Fixed positions
  C5: [
    {
      name: "C5 (Power Chord)",
      positions: [
        { string: 1, fret: -1 },
        { string: 2, fret: -1 },
        { string: 3, fret: -1 },
        { string: 4, fret: -1 },
        { string: 5, fret: 3, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Basic C power chord",
    },
  ],
  D5: [
    {
      name: "D5 (Power Chord)",
      positions: [
        { string: 1, fret: -1 },
        { string: 2, fret: -1 },
        { string: 3, fret: -1 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "Simple D power chord",
    },
  ],
  E5: [
    {
      name: "E5 (Power Chord)",
      positions: [
        { string: 1, fret: -1 },
        { string: 2, fret: -1 },
        { string: 3, fret: -1 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 2, finger: 1 },
        { string: 6, fret: 0 },
      ],
      difficulty: "Beginner",
      description: "Rock E power chord",
    },
  ],
  G5: [
    {
      name: "G5 (Power Chord)",
      positions: [
        { string: 1, fret: -1 },
        { string: 2, fret: -1 },
        { string: 3, fret: -1 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 1 },
        { string: 6, fret: 3, finger: 2 },
      ],
      difficulty: "Beginner",
      description: "G power chord",
    },
  ],
  A5: [
    {
      name: "A5 (Power Chord)",
      positions: [
        { string: 1, fret: -1 },
        { string: 2, fret: -1 },
        { string: 3, fret: -1 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 0 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Beginner",
      description: "A power chord",
    },
  ],

  // 11TH CHORDS - Advanced Jazz Voicings
  C11: [
    {
      name: "C11 (Jazz Voicing)",
      positions: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      description: "C11 jazz chord with suspended sound",
    },
  ],
  D11: [
    {
      name: "D11 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      description: "Open D11 chord",
    },
  ],
  E11: [
    {
      name: "E11 (Open)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 1 },
        { string: 6, fret: 0 },
      ],
      difficulty: "Advanced",
      description: "E11 with open strings",
    },
  ],

  // 13TH CHORDS - Advanced Jazz Extensions
  C13: [
    {
      name: "C13 (Jazz)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      description: "C13 with 6th and 7th",
    },
  ],
  D13: [
    {
      name: "D13 (Jazz)",
      positions: [
        { string: 1, fret: 2, finger: 2 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 3 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      description: "D13 dominant chord",
    },
  ],

  // ALTERED DOMINANTS - Jazz/Blues Extensions
  "C7#5": [
    {
      name: "C7#5 (Altered)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 4, finger: 4 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      description: "C7 with raised 5th",
    },
  ],
  "C7b5": [
    {
      name: "C7b5 (Altered)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 2, finger: 3 },
        { string: 5, fret: 3, finger: 4 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      description: "C7 with flattened 5th",
    },
  ],
  "G7#5": [
    {
      name: "G7#5 (Altered)",
      positions: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 4, finger: 4 },
        { string: 5, fret: 2, finger: 2 },
        { string: 6, fret: 3, finger: 3 },
      ],
      difficulty: "Advanced",
      description: "G7 with augmented 5th",
    },
  ],
  "D7b9": [
    {
      name: "D7b9 (Altered)",
      positions: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      description: "D7 with flattened 9th",
    },
  ],

  // SLASH CHORDS - Bass Note Inversions
  "C/E": [
    {
      name: "C/E (First Inversion)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 2, finger: 3 },
        { string: 6, fret: 0 },
      ],
      difficulty: "Intermediate",
      description: "C major with E in bass",
    },
  ],
  "C/G": [
    {
      name: "C/G (Second Inversion)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: 3, finger: 4 },
      ],
      difficulty: "Intermediate",
      description: "C major with G in bass",
    },
  ],
  "D/F#": [
    {
      name: "D/F# (First Inversion)",
      positions: [
        { string: 1, fret: 2, finger: 2 },
        { string: 2, fret: 3, finger: 3 },
        { string: 3, fret: 2, finger: 1 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: 2, finger: 4 },
      ],
      difficulty: "Intermediate",
      description: "D major with F# in bass",
    },
  ],
  "G/B": [
    {
      name: "G/B (First Inversion)",
      positions: [
        { string: 1, fret: 3, finger: 3 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      description: "G major with B in bass",
    },
  ],
  "Am/C": [
    {
      name: "Am/C (First Inversion)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 3 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 4 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Intermediate",
      description: "A minor with C in bass",
    },
  ],

  // JAZZ VOICINGS - Professional Jazz Chords
  Cmaj9: [
    {
      name: "Cmaj9 (Jazz)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 3, finger: 3 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 4 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      description: "C major 9th jazz voicing",
    },
  ],
  Dm9: [
    {
      name: "Dm9 (Jazz)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
      difficulty: "Advanced",
      description: "D minor 9th chord",
    },
  ],
  Em11: [
    {
      name: "Em11 (Jazz)",
      positions: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 2, finger: 1 },
        { string: 6, fret: 0 },
      ],
      difficulty: "Intermediate",
      description: "E minor 11th - open voicing",
    },
  ],
}

// Function to get chord data using Tonal.js + guitar fingerings
export function getChordInfo(chordSymbol: string): ChordInfo | null {
  try {
    // Get chord theory from Tonal.js
    const tonalChord = Chord.get(chordSymbol)

    if (!tonalChord.name || tonalChord.empty) {
      return null
    }

    // Get guitar fingerings from our database
    const fingerings = guitarFingerings[chordSymbol] || []

    // Create comprehensive chord info
    const chordInfo: ChordInfo = {
      name: tonalChord.name,
      symbol: tonalChord.symbol,
      notes: tonalChord.notes,
      intervals: tonalChord.intervals,
      quality: tonalChord.quality || "Unknown",
      variations: fingerings,
      semitones: tonalChord.intervals?.map((interval, index) => index) || [],
    }

    return chordInfo
  } catch (error) {
    console.error("Error getting chord info:", error)
    return null
  }
}

// Get all available chords
export function getAllAvailableChords(): string[] {
  return Object.keys(guitarFingerings).sort()
}

// Get chords by quality/type
export function getChordsByQuality(quality: string): string[] {
  return getAllAvailableChords().filter((chord) => {
    const info = getChordInfo(chord)
    return info?.quality.toLowerCase().includes(quality.toLowerCase())
  })
}

// Get chords by difficulty
export function getChordsByDifficulty(difficulty: "Beginner" | "Intermediate" | "Advanced"): string[] {
  return getAllAvailableChords().filter((chord) => {
    const info = getChordInfo(chord)
    return info?.variations.some((v) => v.difficulty === difficulty)
  })
}

// Search chords
export function searchChords(query: string): string[] {
  const lowerQuery = query.toLowerCase()
  return getAllAvailableChords().filter((chord) => {
    const info = getChordInfo(chord)
    if (!info) return false

    return (
      chord.toLowerCase().includes(lowerQuery) ||
      info.name.toLowerCase().includes(lowerQuery) ||
      info.quality.toLowerCase().includes(lowerQuery) ||
      info.notes.some((note) => note.toLowerCase().includes(lowerQuery))
    )
  })
}

// Get related chords
export function getRelatedChords(chordSymbol: string): string[] {
  const chordInfo = getChordInfo(chordSymbol)
  if (!chordInfo) return []

  const root = chordInfo.notes[0]
  const quality = chordInfo.quality

  // Find chords with same root or related qualities
  const related = getAllAvailableChords().filter((chord) => {
    if (chord === chordSymbol) return false

    const info = getChordInfo(chord)
    if (!info) return false

    return (
      info.notes[0] === root || // Same root
      info.quality === quality || // Same quality
      (quality === "major" && info.quality === "minor") ||
      (quality === "minor" && info.quality === "major") ||
      (quality.includes("7") && info.quality.includes("7"))
    )
  })

  return related.slice(0, 8)
}

// Get common chord progressions
export function getCommonProgressions(): { name: string; chords: string[]; description: string }[] {
  return [
    {
      name: "I-V-vi-IV (Pop Progression)",
      chords: ["C", "G", "Am", "F"],
      description: "The most popular chord progression in Western music",
    },
    {
      name: "ii-V-I (Jazz Standard)",
      chords: ["Dm7", "G7", "Cmaj7"],
      description: "Essential jazz progression for improvisation",
    },
    {
      name: "I-vi-IV-V (50s Progression)",
      chords: ["C", "Am", "F", "G"],
      description: "Classic doo-wop and early rock progression",
    },
    {
      name: "vi-IV-I-V (Pop Variant)",
      chords: ["Am", "F", "C", "G"],
      description: "Modern pop variation starting on vi",
    },
    {
      name: "12-Bar Blues",
      chords: ["C7", "C7", "C7", "C7", "F7", "F7", "C7", "C7", "G7", "F7", "C7", "G7"],
      description: "Traditional 12-bar blues progression",
    },
    {
      name: "i-VII-VI-VII (Natural Minor)",
      chords: ["Am", "G", "F", "G"],
      description: "Rock progression in natural minor",
    },
    {
      name: "I-V-vi-iii-IV-I-IV-V",
      chords: ["C", "G", "Am", "Em", "F", "C", "F", "G"],
      description: "Extended progression with smooth voice leading",
    },
    {
      name: "Circle of Fifths",
      chords: ["C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "B"],
      description: "Moving through keys by perfect fifths",
    },
  ]
}

// Get library statistics
export function getLibraryStats() {
  const allChords = getAllAvailableChords()
  const chordInfos = allChords.map((chord) => getChordInfo(chord)).filter(Boolean) as ChordInfo[]

  const qualities = [...new Set(chordInfos.map((c) => c.quality))]
  const difficulties = ["Beginner", "Intermediate", "Advanced"] as const

  return {
    totalChords: allChords.length,
    totalVariations: chordInfos.reduce((sum, c) => sum + c.variations.length, 0),
    qualities: qualities.length,
    qualityBreakdown: qualities.map((q) => ({
      quality: q,
      count: chordInfos.filter((c) => c.quality === q).length,
    })),
    difficultyBreakdown: difficulties.map((d) => ({
      difficulty: d,
      count: getChordsByDifficulty(d).length,
    })),
  }
}

// Export commonly used chord sets
export const BEGINNER_CHORDS = ["C", "D", "E", "F", "G", "A", "Am", "Dm", "Em"]
export const INTERMEDIATE_CHORDS = [
  "C7",
  "D7",
  "E7",
  "G7",
  "A7",
  "B7",
  "Cmaj7",
  "Dmaj7",
  "Emaj7",
  "Fmaj7",
  "Gmaj7",
  "Amaj7",
]
export const ADVANCED_CHORDS = ["Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm", "Cm7", "Dm7", "Em7", "Am7"]
export const JAZZ_CHORDS = ["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5"]
export const BLUES_CHORDS = ["C7", "F7", "G7", "A7", "D7", "E7", "B7"]
export const FOLK_CHORDS = ["C", "F", "G", "Am", "Dm", "Em", "Cadd9", "Dsus4", "Gsus4"]
