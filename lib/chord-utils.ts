// Enhanced chord utilities with massive chord database

import { getTonalRelatedChords, identifyChordFromTonal, findScalesContainingTonalChord } from "./tonal-integration"
import { getChordInfo, type ChordInfo } from "./chord-libraries"

export interface ChordPosition {
  string: number // 1-6, where 6 is the low E string and 1 is the high E string
  fret: number // 0 for open string, -1 for muted, otherwise fret number
  finger: number // 1-4, representing index, middle, ring, pinky
}

export interface ChordVariation {
  name: string
  positions: ChordPosition[]
  startFret: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  description?: string
}

export interface ChordData {
  name: string
  type: string
  notes: string[]
  formula: string
  variations: ChordVariation[]
  function?: string
}

// MASSIVE chord fingering database - covers most common chords
const chordFingeringDatabase: Record<string, ChordVariation[]> = {
  // Major chords - ALL KEYS
  C: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open C chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  "C#": [
    {
      name: "Barre Position (4th fret)",
      startFret: 4,
      difficulty: "Intermediate",
      description: "C# major barre chord",
      positions: [
        { string: 6, fret: 4, finger: 1 },
        { string: 5, fret: 6, finger: 3 },
        { string: 4, fret: 6, finger: 4 },
        { string: 3, fret: 5, finger: 2 },
        { string: 2, fret: 4, finger: 1 },
        { string: 1, fret: 4, finger: 1 },
      ],
    },
  ],
  Db: [
    {
      name: "Barre Position (4th fret)",
      startFret: 4,
      difficulty: "Intermediate",
      description: "Db major barre chord",
      positions: [
        { string: 6, fret: 4, finger: 1 },
        { string: 5, fret: 6, finger: 3 },
        { string: 4, fret: 6, finger: 4 },
        { string: 3, fret: 5, finger: 2 },
        { string: 2, fret: 4, finger: 1 },
        { string: 1, fret: 4, finger: 1 },
      ],
    },
  ],
  D: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open D chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 3, finger: 3 },
        { string: 1, fret: 2, finger: 1 },
      ],
    },
  ],
  "D#": [
    {
      name: "Barre Position (6th fret)",
      startFret: 6,
      difficulty: "Intermediate",
      description: "D# major barre chord",
      positions: [
        { string: 6, fret: 6, finger: 1 },
        { string: 5, fret: 8, finger: 3 },
        { string: 4, fret: 8, finger: 4 },
        { string: 3, fret: 7, finger: 2 },
        { string: 2, fret: 6, finger: 1 },
        { string: 1, fret: 6, finger: 1 },
      ],
    },
  ],
  Eb: [
    {
      name: "Barre Position (6th fret)",
      startFret: 6,
      difficulty: "Intermediate",
      description: "Eb major barre chord",
      positions: [
        { string: 6, fret: 6, finger: 1 },
        { string: 5, fret: 8, finger: 3 },
        { string: 4, fret: 8, finger: 4 },
        { string: 3, fret: 7, finger: 2 },
        { string: 2, fret: 6, finger: 1 },
        { string: 1, fret: 6, finger: 1 },
      ],
    },
  ],
  E: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open E chord",
      positions: [
        { string: 6, fret: 0, finger: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 2, finger: 3 },
        { string: 3, fret: 1, finger: 1 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  F: [
    {
      name: "Barre Chord",
      startFret: 1,
      difficulty: "Intermediate",
      description: "Standard F barre chord",
      positions: [
        { string: 6, fret: 1, finger: 1 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 3, finger: 4 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 1, finger: 1 },
      ],
    },
  ],
  "F#": [
    {
      name: "Barre Position (2nd fret)",
      startFret: 2,
      difficulty: "Intermediate",
      description: "F# major barre chord",
      positions: [
        { string: 6, fret: 2, finger: 1 },
        { string: 5, fret: 4, finger: 3 },
        { string: 4, fret: 4, finger: 4 },
        { string: 3, fret: 3, finger: 2 },
        { string: 2, fret: 2, finger: 1 },
        { string: 1, fret: 2, finger: 1 },
      ],
    },
  ],
  Gb: [
    {
      name: "Barre Position (2nd fret)",
      startFret: 2,
      difficulty: "Intermediate",
      description: "Gb major barre chord",
      positions: [
        { string: 6, fret: 2, finger: 1 },
        { string: 5, fret: 4, finger: 3 },
        { string: 4, fret: 4, finger: 4 },
        { string: 3, fret: 3, finger: 2 },
        { string: 2, fret: 2, finger: 1 },
        { string: 1, fret: 2, finger: 1 },
      ],
    },
  ],
  G: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open G chord",
      positions: [
        { string: 6, fret: 3, finger: 3 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 3, finger: 4 },
      ],
    },
  ],
  "G#": [
    {
      name: "Barre Position (4th fret)",
      startFret: 4,
      difficulty: "Intermediate",
      description: "G# major barre chord",
      positions: [
        { string: 6, fret: 4, finger: 1 },
        { string: 5, fret: 6, finger: 3 },
        { string: 4, fret: 6, finger: 4 },
        { string: 3, fret: 5, finger: 2 },
        { string: 2, fret: 4, finger: 1 },
        { string: 1, fret: 4, finger: 1 },
      ],
    },
  ],
  Ab: [
    {
      name: "Barre Position (4th fret)",
      startFret: 4,
      difficulty: "Intermediate",
      description: "Ab major barre chord",
      positions: [
        { string: 6, fret: 4, finger: 1 },
        { string: 5, fret: 6, finger: 3 },
        { string: 4, fret: 6, finger: 4 },
        { string: 3, fret: 5, finger: 2 },
        { string: 2, fret: 4, finger: 1 },
        { string: 1, fret: 4, finger: 1 },
      ],
    },
  ],
  A: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open A chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 0, finger: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 2, finger: 3 },
        { string: 2, fret: 2, finger: 4 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  "A#": [
    {
      name: "Barre Position (6th fret)",
      startFret: 6,
      difficulty: "Intermediate",
      description: "A# major barre chord",
      positions: [
        { string: 6, fret: 6, finger: 1 },
        { string: 5, fret: 8, finger: 3 },
        { string: 4, fret: 8, finger: 4 },
        { string: 3, fret: 7, finger: 2 },
        { string: 2, fret: 6, finger: 1 },
        { string: 1, fret: 6, finger: 1 },
      ],
    },
  ],
  Bb: [
    {
      name: "Barre Position (6th fret)",
      startFret: 6,
      difficulty: "Intermediate",
      description: "Bb major barre chord",
      positions: [
        { string: 6, fret: 6, finger: 1 },
        { string: 5, fret: 8, finger: 3 },
        { string: 4, fret: 8, finger: 4 },
        { string: 3, fret: 7, finger: 2 },
        { string: 2, fret: 6, finger: 1 },
        { string: 1, fret: 6, finger: 1 },
      ],
    },
  ],
  B: [
    {
      name: "Barre Chord",
      startFret: 2,
      difficulty: "Intermediate",
      description: "B major barre chord",
      positions: [
        { string: 6, fret: 2, finger: 1 },
        { string: 5, fret: 4, finger: 3 },
        { string: 4, fret: 4, finger: 4 },
        { string: 3, fret: 3, finger: 2 },
        { string: 2, fret: 2, finger: 1 },
        { string: 1, fret: 2, finger: 1 },
      ],
    },
  ],

  // Minor chords - ALL KEYS
  Am: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open Am chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 0, finger: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 2, finger: 3 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  "A#m": [
    {
      name: "Barre Position (6th fret)",
      startFret: 6,
      difficulty: "Intermediate",
      description: "A# minor barre chord",
      positions: [
        { string: 6, fret: 6, finger: 1 },
        { string: 5, fret: 8, finger: 3 },
        { string: 4, fret: 8, finger: 4 },
        { string: 3, fret: 6, finger: 1 },
        { string: 2, fret: 7, finger: 2 },
        { string: 1, fret: 6, finger: 1 },
      ],
    },
  ],
  Bbm: [
    {
      name: "Barre Position (6th fret)",
      startFret: 6,
      difficulty: "Intermediate",
      description: "Bb minor barre chord",
      positions: [
        { string: 6, fret: 6, finger: 1 },
        { string: 5, fret: 8, finger: 3 },
        { string: 4, fret: 8, finger: 4 },
        { string: 3, fret: 6, finger: 1 },
        { string: 2, fret: 7, finger: 2 },
        { string: 1, fret: 6, finger: 1 },
      ],
    },
  ],
  Bm: [
    {
      name: "Barre Chord",
      startFret: 2,
      difficulty: "Intermediate",
      description: "B minor barre chord",
      positions: [
        { string: 6, fret: 2, finger: 1 },
        { string: 5, fret: 4, finger: 3 },
        { string: 4, fret: 4, finger: 4 },
        { string: 3, fret: 2, finger: 1 },
        { string: 2, fret: 3, finger: 2 },
        { string: 1, fret: 2, finger: 1 },
      ],
    },
  ],
  Cm: [
    {
      name: "Barre Chord",
      startFret: 3,
      difficulty: "Intermediate",
      description: "C minor barre chord",
      positions: [
        { string: 6, fret: 3, finger: 1 },
        { string: 5, fret: 5, finger: 3 },
        { string: 4, fret: 5, finger: 4 },
        { string: 3, fret: 3, finger: 1 },
        { string: 2, fret: 4, finger: 2 },
        { string: 1, fret: 3, finger: 1 },
      ],
    },
  ],
  "C#m": [
    {
      name: "Barre Position (4th fret)",
      startFret: 4,
      difficulty: "Intermediate",
      description: "C# minor barre chord",
      positions: [
        { string: 6, fret: 4, finger: 1 },
        { string: 5, fret: 6, finger: 3 },
        { string: 4, fret: 6, finger: 4 },
        { string: 3, fret: 4, finger: 1 },
        { string: 2, fret: 5, finger: 2 },
        { string: 1, fret: 4, finger: 1 },
      ],
    },
  ],
  Dbm: [
    {
      name: "Barre Position (4th fret)",
      startFret: 4,
      difficulty: "Intermediate",
      description: "Db minor barre chord",
      positions: [
        { string: 6, fret: 4, finger: 1 },
        { string: 5, fret: 6, finger: 3 },
        { string: 4, fret: 6, finger: 4 },
        { string: 3, fret: 4, finger: 1 },
        { string: 2, fret: 5, finger: 2 },
        { string: 1, fret: 4, finger: 1 },
      ],
    },
  ],
  Dm: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open Dm chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 3, finger: 3 },
        { string: 1, fret: 1, finger: 1 },
      ],
    },
  ],
  "D#m": [
    {
      name: "Barre Position (6th fret)",
      startFret: 6,
      difficulty: "Intermediate",
      description: "D# minor barre chord",
      positions: [
        { string: 6, fret: 6, finger: 1 },
        { string: 5, fret: 8, finger: 3 },
        { string: 4, fret: 8, finger: 4 },
        { string: 3, fret: 6, finger: 1 },
        { string: 2, fret: 7, finger: 2 },
        { string: 1, fret: 6, finger: 1 },
      ],
    },
  ],
  Ebm: [
    {
      name: "Barre Position (6th fret)",
      startFret: 6,
      difficulty: "Intermediate",
      description: "Eb minor barre chord",
      positions: [
        { string: 6, fret: 6, finger: 1 },
        { string: 5, fret: 8, finger: 3 },
        { string: 4, fret: 8, finger: 4 },
        { string: 3, fret: 6, finger: 1 },
        { string: 2, fret: 7, finger: 2 },
        { string: 1, fret: 6, finger: 1 },
      ],
    },
  ],
  Em: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open Em chord",
      positions: [
        { string: 6, fret: 0, finger: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 2, finger: 3 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Fm: [
    {
      name: "Barre Chord",
      startFret: 1,
      difficulty: "Intermediate",
      description: "F minor barre chord",
      positions: [
        { string: 6, fret: 1, finger: 1 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 3, finger: 4 },
        { string: 3, fret: 1, finger: 1 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 1, finger: 1 },
      ],
    },
  ],
  "F#m": [
    {
      name: "Barre Position (2nd fret)",
      startFret: 2,
      difficulty: "Intermediate",
      description: "F# minor barre chord",
      positions: [
        { string: 6, fret: 2, finger: 1 },
        { string: 5, fret: 4, finger: 3 },
        { string: 4, fret: 4, finger: 4 },
        { string: 3, fret: 2, finger: 1 },
        { string: 2, fret: 2, finger: 1 },
        { string: 1, fret: 2, finger: 1 },
      ],
    },
  ],
  Gbm: [
    {
      name: "Barre Position (2nd fret)",
      startFret: 2,
      difficulty: "Intermediate",
      description: "Gb minor barre chord",
      positions: [
        { string: 6, fret: 2, finger: 1 },
        { string: 5, fret: 4, finger: 3 },
        { string: 4, fret: 4, finger: 4 },
        { string: 3, fret: 2, finger: 1 },
        { string: 2, fret: 2, finger: 1 },
        { string: 1, fret: 2, finger: 1 },
      ],
    },
  ],
  Gm: [
    {
      name: "Barre Chord",
      startFret: 3,
      difficulty: "Intermediate",
      description: "G minor barre chord",
      positions: [
        { string: 6, fret: 3, finger: 1 },
        { string: 5, fret: 5, finger: 3 },
        { string: 4, fret: 5, finger: 4 },
        { string: 3, fret: 3, finger: 1 },
        { string: 2, fret: 3, finger: 1 },
        { string: 1, fret: 3, finger: 1 },
      ],
    },
  ],
  "G#m": [
    {
      name: "Barre Position (4th fret)",
      startFret: 4,
      difficulty: "Intermediate",
      description: "G# minor barre chord",
      positions: [
        { string: 6, fret: 4, finger: 1 },
        { string: 5, fret: 6, finger: 3 },
        { string: 4, fret: 6, finger: 4 },
        { string: 3, fret: 4, finger: 1 },
        { string: 2, fret: 4, finger: 1 },
        { string: 1, fret: 4, finger: 1 },
      ],
    },
  ],
  Abm: [
    {
      name: "Barre Position (4th fret)",
      startFret: 4,
      difficulty: "Intermediate",
      description: "Ab minor barre chord",
      positions: [
        { string: 6, fret: 4, finger: 1 },
        { string: 5, fret: 6, finger: 3 },
        { string: 4, fret: 6, finger: 4 },
        { string: 3, fret: 4, finger: 1 },
        { string: 2, fret: 4, finger: 1 },
        { string: 1, fret: 4, finger: 1 },
      ],
    },
  ],

  // 7th chords
  A7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open A7 chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 0, finger: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 2, finger: 3 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  B7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "Standard open B7 chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 3 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 2, finger: 4 },
      ],
    },
  ],
  C7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "Standard open C7 chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 3, finger: 4 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  D7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open D7 chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 2, finger: 3 },
      ],
    },
  ],
  E7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open E7 chord",
      positions: [
        { string: 6, fret: 0, finger: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 1, finger: 1 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  F7: [
    {
      name: "Barre Chord",
      startFret: 1,
      difficulty: "Intermediate",
      description: "F7 barre chord",
      positions: [
        { string: 6, fret: 1, finger: 1 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 1, finger: 1 },
      ],
    },
  ],
  G7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "Standard open G7 chord",
      positions: [
        { string: 6, fret: 3, finger: 3 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 1, finger: 1 },
      ],
    },
  ],

  // Major 7th chords
  Amaj7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "A major 7th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 0, finger: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 1, finger: 1 },
        { string: 2, fret: 2, finger: 3 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Cmaj7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "C major 7th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Dmaj7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "D major 7th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 2, finger: 1 },
        { string: 1, fret: 2, finger: 3 },
      ],
    },
  ],
  Emaj7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "E major 7th chord",
      positions: [
        { string: 6, fret: 0, finger: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 1, finger: 1 },
        { string: 3, fret: 1, finger: 1 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Fmaj7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "F major 7th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 3, finger: 3 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Gmaj7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "G major 7th chord",
      positions: [
        { string: 6, fret: 3, finger: 3 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 2, finger: 1 },
      ],
    },
  ],

  // Minor 7th chords
  Am7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "A minor 7th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 0, finger: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Bm7: [
    {
      name: "Barre Position",
      startFret: 2,
      difficulty: "Intermediate",
      description: "B minor 7th chord",
      positions: [
        { string: 6, fret: 2, finger: 1 },
        { string: 5, fret: 4, finger: 3 },
        { string: 4, fret: 2, finger: 1 },
        { string: 3, fret: 2, finger: 1 },
        { string: 2, fret: 2, finger: 1 },
        { string: 1, fret: 2, finger: 1 },
      ],
    },
  ],
  Cm7: [
    {
      name: "Barre Position",
      startFret: 3,
      difficulty: "Intermediate",
      description: "C minor 7th chord",
      positions: [
        { string: 6, fret: 3, finger: 1 },
        { string: 5, fret: 5, finger: 3 },
        { string: 4, fret: 3, finger: 1 },
        { string: 3, fret: 3, finger: 1 },
        { string: 2, fret: 4, finger: 2 },
        { string: 1, fret: 3, finger: 1 },
      ],
    },
  ],
  Dm7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "D minor 7th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 1, finger: 1 },
      ],
    },
  ],
  Em7: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "E minor 7th chord",
      positions: [
        { string: 6, fret: 0, finger: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Fm7: [
    {
      name: "Barre Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "F minor 7th chord",
      positions: [
        { string: 6, fret: 1, finger: 1 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 1, finger: 1 },
        { string: 3, fret: 1, finger: 1 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 1, finger: 1 },
      ],
    },
  ],
  Gm7: [
    {
      name: "Barre Position",
      startFret: 3,
      difficulty: "Intermediate",
      description: "G minor 7th chord",
      positions: [
        { string: 6, fret: 3, finger: 1 },
        { string: 5, fret: 5, finger: 3 },
        { string: 4, fret: 3, finger: 1 },
        { string: 3, fret: 3, finger: 1 },
        { string: 2, fret: 3, finger: 1 },
        { string: 1, fret: 3, finger: 1 },
      ],
    },
  ],

  // Suspended chords
  Asus2: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "A suspended 2nd chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 0, finger: 0 },
        { string: 4, fret: 2, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Asus4: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "A suspended 4th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 0, finger: 0 },
        { string: 4, fret: 2, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 3, finger: 3 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Csus2: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "C suspended 2nd chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 3, finger: 4 },
      ],
    },
  ],
  Csus4: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "C suspended 4th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 1, finger: 1 },
      ],
    },
  ],
  Dsus2: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "D suspended 2nd chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 2, finger: 1 },
        { string: 2, fret: 3, finger: 3 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Dsus4: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "D suspended 4th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 2, finger: 1 },
        { string: 2, fret: 3, finger: 3 },
        { string: 1, fret: 3, finger: 4 },
      ],
    },
  ],
  Esus4: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Beginner",
      description: "E suspended 4th chord",
      positions: [
        { string: 6, fret: 0, finger: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 2, finger: 3 },
        { string: 3, fret: 2, finger: 4 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Gsus4: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "G suspended 4th chord",
      positions: [
        { string: 6, fret: 3, finger: 3 },
        { string: 5, fret: 3, finger: 4 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 3, finger: 3 },
      ],
    },
  ],

  // Add9 chords
  Cadd9: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "C add9 chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 3, finger: 4 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Dadd9: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "D add9 chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 2, finger: 1 },
        { string: 2, fret: 3, finger: 3 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Gadd9: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "G add9 chord",
      positions: [
        { string: 6, fret: 3, finger: 3 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 3, finger: 4 },
      ],
    },
  ],

  // Diminished chords
  Adim: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "A diminished chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 0, finger: 0 },
        { string: 4, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: -1, finger: 0 },
      ],
    },
  ],
  Bdim: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "B diminished chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 3, finger: 3 },
        { string: 3, fret: 2, finger: 1 },
        { string: 2, fret: 3, finger: 4 },
        { string: 1, fret: -1, finger: 0 },
      ],
    },
  ],
  Cdim: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "C diminished chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 4, finger: 4 },
        { string: 3, fret: 2, finger: 1 },
        { string: 2, fret: 4, finger: 4 },
        { string: 1, fret: 2, finger: 2 },
      ],
    },
  ],
  Ddim: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "D diminished chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 1, finger: 1 },
        { string: 2, fret: 3, finger: 4 },
        { string: 1, fret: 1, finger: 2 },
      ],
    },
  ],
  Edim: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "E diminished chord",
      positions: [
        { string: 6, fret: 0, finger: 0 },
        { string: 5, fret: 1, finger: 1 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 2, finger: 3 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  Fdim: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "F diminished chord",
      positions: [
        { string: 6, fret: 1, finger: 1 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 3, finger: 3 },
        { string: 3, fret: 1, finger: 1 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 1, finger: 1 },
      ],
    },
  ],
  Gdim: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "G diminished chord",
      positions: [
        { string: 6, fret: 3, finger: 3 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 3, finger: 4 },
        { string: 2, fret: 2, finger: 1 },
        { string: 1, fret: -1, finger: 0 },
      ],
    },
  ],

  // 6th chords
  A6: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "A 6th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 0, finger: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 2, finger: 3 },
        { string: 2, fret: 2, finger: 4 },
        { string: 1, fret: 2, finger: 1 },
      ],
    },
  ],
  C6: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "C 6th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 2, finger: 1 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  D6: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "D 6th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 2, finger: 1 },
      ],
    },
  ],
  E6: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "E 6th chord",
      positions: [
        { string: 6, fret: 0, finger: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 2, finger: 3 },
        { string: 3, fret: 1, finger: 1 },
        { string: 2, fret: 2, finger: 4 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  G6: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Intermediate",
      description: "G 6th chord",
      positions: [
        { string: 6, fret: 3, finger: 3 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],

  // 9th chords
  A9: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Advanced",
      description: "A 9th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 0, finger: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 4, finger: 4 },
        { string: 2, fret: 2, finger: 1 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  C9: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Advanced",
      description: "C 9th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: 3, finger: 3 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 3, finger: 4 },
        { string: 2, fret: 3, finger: 4 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  D9: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Advanced",
      description: "D 9th chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 1, finger: 1 },
        { string: 1, fret: 0, finger: 0 },
      ],
    },
  ],
  E9: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Advanced",
      description: "E 9th chord",
      positions: [
        { string: 6, fret: 0, finger: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 0, finger: 0 },
        { string: 3, fret: 1, finger: 1 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 2, finger: 3 },
      ],
    },
  ],
  G9: [
    {
      name: "Open Position",
      startFret: 1,
      difficulty: "Advanced",
      description: "G 9th chord",
      positions: [
        { string: 6, fret: 3, finger: 3 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 3, finger: 4 },
        { string: 3, fret: 0, finger: 0 },
        { string: 2, fret: 0, finger: 0 },
        { string: 1, fret: 1, finger: 1 },
      ],
    },
  ],
}

// Get chord data function with Tonal.js integration
export function getChordData(chordName: string): ChordInfo | null {
  return getChordInfo(chordName)
}

// Get chord variations from fingering database
function getChordVariations(chordName: string): ChordVariation[] {
  const normalizedName = normalizeChordName(chordName)

  // Check exact match first
  if (chordFingeringDatabase[normalizedName]) {
    return chordFingeringDatabase[normalizedName]
  }

  // Try common variations and aliases
  const variations = [
    chordName,
    chordName.toLowerCase(),
    chordName.toUpperCase(),
    normalizedName,
    // Handle enharmonic equivalents
    chordName
      .replace("b", "#")
      .replace("C#", "Db")
      .replace("D#", "Eb")
      .replace("F#", "Gb")
      .replace("G#", "Ab")
      .replace("A#", "Bb"),
    chordName.replace("#", "b"),
  ]

  for (const variation of variations) {
    if (chordFingeringDatabase[variation]) {
      return chordFingeringDatabase[variation]
    }
  }

  // Return a default "not found" variation
  return [
    {
      name: "Position not available",
      startFret: 1,
      difficulty: "Beginner" as const,
      description: "Fingering not available for this chord",
      positions: [
        { string: 6, fret: -1, finger: 0 },
        { string: 5, fret: -1, finger: 0 },
        { string: 4, fret: -1, finger: 0 },
        { string: 3, fret: -1, finger: 0 },
        { string: 2, fret: -1, finger: 0 },
        { string: 1, fret: -1, finger: 0 },
      ],
    },
  ]
}

// Helper function to normalize chord names
export function normalizeChordName(chordName: string): string {
  return chordName
    .replace(/maj7/g, "maj7")
    .replace(/min7/g, "m7")
    .replace(/minor/g, "m")
    .replace(/major/g, "")
    .replace(/dom7/g, "7")
    .replace(/dominant/g, "7")
    .trim()
}

// Get chord suggestions based on key
export function getChordsInKey(key: string): string[] {
  const majorScaleChords: { [key: string]: string[] } = {
    C: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
    G: ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
    D: ["D", "Em", "F#m", "G", "A", "Bm", "C#dim"],
    A: ["A", "Bm", "C#m", "D", "E", "F#m", "G#dim"],
    E: ["E", "F#m", "G#m", "A", "B", "C#m", "D#dim"],
    B: ["B", "C#m", "D#m", "E", "F#", "G#m", "A#dim"],
    "F#": ["F#", "G#m", "A#m", "B", "C#", "D#m", "E#dim"],
    F: ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"],
    Bb: ["Bb", "Cm", "Dm", "Eb", "F", "Gm", "Adim"],
    Eb: ["Eb", "Fm", "Gm", "Ab", "Bb", "Cm", "Ddim"],
    Ab: ["Ab", "Bbm", "Cm", "Db", "Eb", "Fm", "Gdim"],
    Db: ["Db", "Ebm", "Fm", "Gb", "Ab", "Bbm", "Cdim"],
  }

  return majorScaleChords[key] || []
}

// Get chord function in key (I, ii, iii, etc.)
export function getChordFunction(chord: string, key: string): string {
  const chordsInKey = getChordsInKey(key)
  const index = chordsInKey.indexOf(chord)

  if (index === -1) return "Unknown"

  const functions = ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
  return functions[index] || "Unknown"
}

// Check if chord exists in our library
export function isValidChord(chordName: string): boolean {
  return getChordInfo(chordName) !== null
}

// Get chord complexity score (1-10)
export function getChordComplexity(chordName: string): number {
  const chordInfo = getChordInfo(chordName)
  if (!chordInfo) return 0

  // Base complexity on chord type and fingering difficulty
  let complexity = 1

  // Add complexity based on chord type
  if (chordInfo.quality.includes("7")) complexity += 2
  if (chordInfo.quality.includes("9")) complexity += 3
  if (chordInfo.quality.includes("11")) complexity += 4
  if (chordInfo.quality.includes("13")) complexity += 5
  if (chordInfo.quality.includes("sus")) complexity += 1
  if (chordInfo.quality.includes("add")) complexity += 1
  if (chordInfo.quality.includes("dim")) complexity += 2
  if (chordInfo.quality.includes("aug")) complexity += 2

  // Add complexity based on fingering difficulty
  const avgDifficulty =
    chordInfo.variations.reduce((sum, v) => {
      const difficultyScore = v.difficulty === "Beginner" ? 1 : v.difficulty === "Intermediate" ? 2 : 3
      return sum + difficultyScore
    }, 0) / chordInfo.variations.length

  complexity += avgDifficulty

  return Math.min(Math.round(complexity), 10)
}

// Get alternative chord names (enharmonic equivalents)
export function getAlternativeNames(chordName: string): string[] {
  const enharmonicMap: { [key: string]: string[] } = {
    "C#": ["Db"],
    Db: ["C#"],
    "D#": ["Eb"],
    Eb: ["D#"],
    "F#": ["Gb"],
    Gb: ["F#"],
    "G#": ["Ab"],
    Ab: ["G#"],
    "A#": ["Bb"],
    Bb: ["A#"],
  }

  const alternatives: string[] = []

  for (const [original, alts] of Object.entries(enharmonicMap)) {
    if (chordName.startsWith(original)) {
      alts.forEach((alt) => {
        alternatives.push(chordName.replace(original, alt))
      })
    }
  }

  return alternatives
}

// Get related chords using Tonal.js
export function getRelatedChords(chordName: string): any[] {
  return getTonalRelatedChords(chordName)
}

// Identify chord from notes using Tonal.js
export function identifyChordFromNotes(selectedNotes: string[]): any[] {
  return identifyChordFromTonal(selectedNotes)
}

// Find scales containing chord using Tonal.js
export function findScalesContainingChord(chordName: string): any[] {
  return findScalesContainingTonalChord(chordName)
}
