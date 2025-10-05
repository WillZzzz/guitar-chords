// Integration with Tonal.js for comprehensive chord library

// Import Tonal modules
import { Chord, Note, Scale } from "@tonaljs/tonal"

export interface TonalChordData {
  name: string
  type: string
  notes: string[]
  formula: string
  intervals: string[]
  quality: string
  aliases: string[]
}

// Get chord data using Tonal.js
export function getTonalChordData(chordName: string): TonalChordData | null {
  try {
    // Parse the chord using Tonal
    const chord = Chord.get(chordName)

    if (!chord.name || chord.empty) {
      console.log(`Chord not found in Tonal: ${chordName}`)
      return null
    }

    // Determine chord type/quality
    let chordType = "Major"
    let quality = chord.quality || "Major"

    if (chord.aliases.some((alias) => alias.includes("m") && !alias.includes("maj"))) {
      chordType = "Minor"
      quality = "Minor"
    } else if (chord.aliases.some((alias) => alias.includes("dim"))) {
      chordType = "Diminished"
      quality = "Diminished"
    } else if (chord.aliases.some((alias) => alias.includes("aug"))) {
      chordType = "Augmented"
      quality = "Augmented"
    } else if (chord.aliases.some((alias) => alias.includes("sus"))) {
      chordType = "Suspended"
      quality = "Suspended"
    } else if (chord.aliases.some((alias) => alias.includes("7"))) {
      if (chord.aliases.some((alias) => alias.includes("maj7"))) {
        chordType = "Major 7th"
        quality = "Major 7th"
      } else if (chord.aliases.some((alias) => alias.includes("m7"))) {
        chordType = "Minor 7th"
        quality = "Minor 7th"
      } else {
        chordType = "Dominant 7th"
        quality = "Dominant 7th"
      }
    }

    return {
      name: chord.name,
      type: chordType,
      notes: chord.notes,
      formula: chord.intervals.join("-"),
      intervals: chord.intervals,
      quality: quality,
      aliases: chord.aliases,
    }
  } catch (error) {
    console.error("Error getting chord data from Tonal:", error)
    return null
  }
}

// Get related chords using Tonal.js
export function getTonalRelatedChords(chordName: string): any[] {
  try {
    const chord = Chord.get(chordName)
    if (!chord.name || chord.empty) return []

    const rootNote = chord.tonic || chordName.charAt(0)
    const relatedChords = []

    // Common chord variations with the same root
    const variations = [
      "", // Major
      "m", // Minor
      "7", // Dominant 7th
      "maj7", // Major 7th
      "m7", // Minor 7th
      "sus2", // Suspended 2nd
      "sus4", // Suspended 4th
      "dim", // Diminished
      "aug", // Augmented
      "add9", // Add 9
      "6", // 6th
      "m6", // Minor 6th
      "9", // 9th
      "m9", // Minor 9th
      "maj9", // Major 9th
      "11", // 11th
      "13", // 13th
    ]

    const commonVariations = variations
      .map((suffix) => {
        const chordSymbol = rootNote + suffix
        const chordData = Chord.get(chordSymbol)
        return {
          name: chordSymbol,
          description: chordData.quality || suffix || "major",
          notes: chordData.notes,
        }
      })
      .filter((chord) => chord.notes.length > 0)

    relatedChords.push({
      relationship: "Common Variations",
      chords: commonVariations.slice(0, 8), // Limit to first 8
      explanation: "These are common variations of chords with the same root note.",
    })

    // Diatonic chords (chords in the same key)
    try {
      const scale = Scale.get(`${rootNote} major`)
      if (scale.notes.length > 0) {
        const diatonicChords = scale.notes
          .map((note, index) => {
            const degree = index + 1
            let chordSuffix = ""

            // Determine chord quality based on scale degree
            if (degree === 1 || degree === 4 || degree === 5) {
              chordSuffix = "" // Major
            } else if (degree === 2 || degree === 3 || degree === 6) {
              chordSuffix = "m" // Minor
            } else if (degree === 7) {
              chordSuffix = "dim" // Diminished
            }

            const chordSymbol = note + chordSuffix
            const chordData = Chord.get(chordSymbol)

            return {
              name: chordSymbol,
              description: `${getRomanNumeral(degree)} chord`,
              notes: chordData.notes,
            }
          })
          .filter((chord) => chord.notes.length > 0)

        if (diatonicChords.length > 0) {
          relatedChords.push({
            relationship: `Diatonic Chords in ${rootNote} Major`,
            chords: diatonicChords,
            explanation: "These chords naturally occur in the same major scale.",
          })
        }
      }
    } catch (error) {
      console.log("Could not generate diatonic chords")
    }

    return relatedChords
  } catch (error) {
    console.error("Error getting related chords:", error)
    return []
  }
}

// Helper function to get Roman numerals
function getRomanNumeral(degree: number): string {
  const numerals = ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
  return numerals[degree - 1] || degree.toString()
}

// Identify chord from notes using Tonal.js
export function identifyChordFromTonal(notes: string[]): any[] {
  try {
    if (!notes || notes.length < 2) return []

    const results: any[] = []

    // Try to detect chords from the given notes
    const chordDetections = Chord.detect(notes)

    chordDetections.forEach((chordName) => {
      const chord = Chord.get(chordName)
      if (chord.name && !chord.empty) {
        // Calculate confidence based on how many notes match
        const matchingNotes = chord.notes.filter((note) => notes.includes(note))
        const confidence = Math.round((matchingNotes.length / Math.max(chord.notes.length, notes.length)) * 100)

        results.push({
          name: chord.name,
          notes: chord.notes,
          confidence: confidence,
          quality: chord.quality,
        })
      }
    })

    // Sort by confidence
    return results.sort((a, b) => b.confidence - a.confidence).slice(0, 10)
  } catch (error) {
    console.error("Error identifying chord from notes:", error)
    return []
  }
}

// Find scales containing a chord using Tonal.js
export function findScalesContainingTonalChord(chordName: string): any[] {
  try {
    const chord = Chord.get(chordName)
    if (!chord.name || chord.empty) return []

    const rootNote = chord.tonic || chordName.charAt(0)
    const results: any[] = []

    // Common scales to check
    const scaleTypes = ["major", "minor", "dorian", "mixolydian", "lydian", "phrygian", "locrian"]

    scaleTypes.forEach((scaleType) => {
      try {
        const scale = Scale.get(`${rootNote} ${scaleType}`)
        if (scale.notes.length > 0) {
          // Check if all chord notes are in the scale
          const chordNotesInScale = chord.notes.every((note) => scale.notes.includes(Note.get(note).pc))

          if (chordNotesInScale) {
            // Find the position of the chord root in the scale
            const rootPosition = scale.notes.indexOf(Note.get(rootNote).pc)
            const position = rootPosition >= 0 ? rootPosition + 1 : 1

            results.push({
              scaleName: `${rootNote} ${scaleType}`,
              position: getRomanNumeral(position),
              function: ` (${getChordFunction(position, scaleType)})`,
            })
          }
        }
      } catch (error) {
        // Skip scales that cause errors
      }
    })

    return results
  } catch (error) {
    console.error("Error finding scales:", error)
    return []
  }
}

// Helper function to get chord function
function getChordFunction(position: number, scaleType: string): string {
  if (scaleType === "major") {
    const functions = ["tonic", "supertonic", "mediant", "subdominant", "dominant", "submediant", "leading tone"]
    return functions[position - 1] || "chord"
  }
  return "chord"
}
